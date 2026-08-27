import {
	DirectionProvider, MantineProvider, MantineStyleProps,
	useMantineColorScheme, useMantineTheme,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications, notifications as notif } from '@mantine/notifications';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { shellEventBus } from '../eventBus';
import { useLocalSettings } from '../userContext';


export type UIProvidersProps = React.PropsWithChildren;

export const UIProviders: React.FC<UIProvidersProps> = ({ children }) => {
	return (
		<DirectionProvider>
			{/* `auto` rather than `light`: it is the value the backend defaults to, and it is
				what the interface should show before the user's stored choice has loaded --
				overriding a device set to dark with a flash of light is worse than deferring
				to it. `ApplyStoredTheme` takes over as soon as the setting arrives. */}
			<MantineProvider theme={{} as any} defaultColorScheme='auto'>
				<ApplyStoredTheme />
				<Notifications
					position='bottom-right'
					autoClose={3_000}
					limit={5}
				/>
				<ModalsProvider>
					<UIStateProvider>
						{children}
					</UIStateProvider>
				</ModalsProvider>
			</MantineProvider>
		</DirectionProvider>
	);
};

/**
 * Published by a settings pane after it writes the Shell's mirrored settings.
 *
 * Must match the name `settingsSaveBar.tsx` publishes; a micro-app cannot import the Shell, so
 * the string is the contract.
 */
const LOCAL_SETTINGS_CHANGED_EVENT = 'shell:local_settings:changed';

/**
 * Where Mantine keeps the scheme the user chose (`light` | `dark` | `auto`).
 *
 * Mantine's own default, restated because the value is needed for a comparison and the library
 * exposes no getter for it -- `useMantineColorScheme().colorScheme` reports the *resolved*
 * scheme, which is a different question. `MantineProvider` is mounted without a custom
 * `colorSchemeManager`, so this is the key in use; passing one would mean changing this too.
 */
const MANTINE_COLOR_SCHEME_KEY = 'mantine-color-scheme-value';

/**
 * The scheme Mantine has stored, or null when it has none or storage is unreadable.
 *
 * Guarded because `localStorage` throws rather than returning null in a few real contexts --
 * privacy modes and blocked site data among them -- and a theme preference is never worth taking
 * the interface down for.
 */
function readStoredColorScheme(): string | null {
	try {
		return localStorage.getItem(MANTINE_COLOR_SCHEME_KEY);
	}
	catch {
		return null;
	}
}

/**
 * Applies the user's stored `theme_mode` to Mantine.
 *
 * Renders nothing; it exists only for the effect. Without it the theme was fetched from
 * `v1/iam/me/context`, mirrored into local settings and then never used -- the provider's
 * hardcoded default won, so changing the setting had no visible result.
 *
 * It reacts to *changes* in the setting rather than continuously asserting it, which is what keeps
 * it from fighting the theme switcher or another tab -- see the effect for the flicker that
 * behaviour caused. A change made in the switcher therefore stands until the setting itself
 * changes again.
 */
function ApplyStoredTheme(): null {
	const localSettings = useLocalSettings();
	const { setColorScheme } = useMantineColorScheme();
	const storedTheme = localSettings?.themeMode;
	// Bumped by the event below to re-run the effect when the store write happened in another
	// React tree, where this component's selector does not re-render.
	const [signal, setSignal] = useState(0);
	// The last value this component pushed into Mantine. A ref rather than state: it must not
	// itself cause a render, and it only ever gates the effect below.
	const appliedTheme = useRef<string | null>(null);

	useEffect(() => {
		return shellEventBus.subscribe(
			LOCAL_SETTINGS_CHANGED_EVENT,
			() => setSignal(n => n + 1),
		);
	}, []);

	useEffect(() => {
		if (!storedTheme) return;

		// Push only when *this tab's* setting actually changed -- on the first run, and afterwards
		// whenever `storedTheme` differs from what this component last applied.
		//
		// The tracking ref is what makes this safe across tabs, and the flicker it fixes is worth
		// spelling out. `setColorScheme` always writes `localStorage`; every such write raises a
		// `storage` event in *other* tabs, where Mantine applies it, re-rendering them and
		// re-running this effect. A tab's `themeMode` is read from `localStorage` once at boot and
		// never refreshed, so after a save in one tab the others still hold the previous value.
		// Re-asserting it on every run therefore had two tabs overwriting each other several times
		// a second -- the light/dark strobe -- and comparing against Mantine's stored key alone
		// could not settle it, because each tab's comparison was against a different `storedTheme`.
		//
		// Reacting to a change rather than defending a value means a tab whose setting did not
		// change stays quiet, and the tab that did change wins once. Whoever saved last is the
		// most recent intent, which is the behaviour a user expects.
		if (appliedTheme.current === storedTheme) return;
		appliedTheme.current = storedTheme;

		// Still skip a redundant write: on first load Mantine has usually persisted this already,
		// and a no-op write would wake every other tab for nothing.
		if (readStoredColorScheme() === storedTheme) return;
		setColorScheme(storedTheme);
	}, [storedTheme, signal, setColorScheme]);

	return null;
}

export type ScreenState = {
	currentScreen: string,
	prevScreen: string,
};

export type UIStateContextType = {
	backgroundColor?: MantineStyleProps['bg'],
	isScrollingUp: boolean,
	isMobile: boolean,
	notification: {
		showError: (message: string, title: string) => void,
		showInfo: (message: string, title: string) => void,
		showWarning: (message: string, title: string) => void,
	},
	screen: {
		currentScreen: string,
		prevScreen: string,
		setCurrentScreen: (screen: string) => void,
	},
};

const UIStateContext = createContext<UIStateContextType>({} as any);

export const useUIState = () => {
	const context = useContext(UIStateContext);
	if (!context) {
		throw new Error('useUIState must be used within UIProvider');
	}
	return context;
};

const UIStateProvider: React.FC<UIProvidersProps> = ({ children }) => {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const backgroundColor = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	const isScrollingUp = useScrollDirection();
	const isMobile = useMobileScreen();
	const notifActions = useNotification();
	const [screenState, setScreenState] = useState<ScreenState>({ currentScreen: '', prevScreen: '' });

	const uiContextValue: UIStateContextType = {
		backgroundColor,
		isMobile,
		isScrollingUp,
		notification: notifActions,
		screen: {
			currentScreen: screenState.currentScreen,
			prevScreen: screenState.prevScreen,
			setCurrentScreen: (screen) => {
				setScreenState({ currentScreen: screen, prevScreen: screenState.currentScreen });
			},
		},
	};

	return (
		<UIStateContext.Provider value={uiContextValue}>
			{children}
		</UIStateContext.Provider>
	);
};

function useMobileScreen(breakpoint = 768) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);

		// Initial check
		checkMobile();

		// Add event listener
		window.addEventListener('resize', checkMobile);

		// Cleanup
		return () => window.removeEventListener('resize', checkMobile);
	}, [breakpoint]);

	return isMobile;
}

function useScrollDirection(threshold = 10) {
	const [isScrollingUp, setIsScrollingUp] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const updateScroll = () => {
			const currentScrollY = window.scrollY;

			if (Math.abs(currentScrollY - lastScrollY) < threshold) return;

			setIsScrollingUp(currentScrollY < lastScrollY);
			setLastScrollY(currentScrollY);
		};

		window.addEventListener('scroll', updateScroll);
		return () => window.removeEventListener('scroll', updateScroll);
	}, [lastScrollY, threshold]);

	return isScrollingUp;
}

/**
 * Stable identity across renders: consumers put `notification` in effect dependency arrays,
 * and a fresh object each render would re-run those effects on every parent render.
 */
function useNotification() {
	return useMemo(() => {
		const showError = (message: string, title = 'Error') => {
			notif.show({
				title,
				message,
				color: 'red',
				autoClose: true,
				withBorder: true,
			});
		};

		const showInfo = (message: string, title = 'Info') => {
			notif.show({
				title,
				message,
				color: 'green',
				withBorder: true,
			});
		};

		const showWarning = (message: string, title = 'Warning') => {
			notif.show({
				title,
				message,
				color: 'orange',
				withBorder: true,
			});
		};

		return { showError, showInfo, showWarning };
	}, []);
}