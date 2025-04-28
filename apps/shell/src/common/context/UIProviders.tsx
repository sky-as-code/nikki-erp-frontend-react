'use client';

import {
	DirectionProvider, MantineProvider, MantineStyleProps,
	useMantineColorScheme, useMantineTheme,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications, notifications as notif } from '@mantine/notifications';
import { createContext, useContext, useEffect, useState } from 'react';

import { theme } from '@/styles/theme';


export type UIProvidersProps = React.PropsWithChildren;

export const UIProviders: React.FC<UIProvidersProps> = ({ children }) => {
	return (
		<DirectionProvider>
			<MantineProvider theme={theme} defaultColorScheme='light'>
				<Notifications
					position='top-center'
					autoClose={10_000}
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

export type ScreenState = {
	currentScreen: string,
	prevScreen: string,
};

export type UIStateContextType = {
	backgroundColor?: MantineStyleProps['bg'],
	isScrollingUp: boolean,
	isMobile: boolean,
	notification: {
		showError: (message: string, title: string) => void;
		showInfo: (message: string, title: string) => void;
		showWarning: (message: string, title: string) => void;
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

function useNotification() {
	const showError = (message: string, title = 'Error') => {
		notif.show({
			title,
			message,
			color: 'red',
			autoClose: false,
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
}