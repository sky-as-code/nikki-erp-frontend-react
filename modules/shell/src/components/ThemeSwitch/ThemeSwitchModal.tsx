import { Divider, Flex, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { testAttrs } from '@nikkierp/common/utils';
import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { useShellCommand } from '@nikkierp/shell/commandBus';
import { useUIState } from '@nikkierp/shell/contexts';
import { Density, ThemeMode, useDensity, useThemeMode } from '@nikkierp/shell/userContext';
import { Button, Modal } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import {
	IconBaselineDensityMedium, IconBaselineDensitySmall, IconBrightnessFilled, IconMoonStars, IconSun,
} from '@tabler/icons-react';
import { forwardRef, useCallback, useImperativeHandle } from 'react';


const TEST_ID = 'shell.themeSwitchModal';

/**
 * Owned by the settings micro-app, which the command bus loads on first use. Restated rather than
 * imported: the Shell never imports a module. Must match `modules/settings/src/features/settings/commands.ts`.
 */
const SETTINGS_SET_COMMAND = 'settings.settings.set_settings';

const THEMES: { labelKey: string, value: ThemeMode, icon: React.ReactNode }[] = [
	{ labelKey: 'theme.light', value: 'light', icon: <IconSun size={30} /> },
	{ labelKey: 'theme.dark', value: 'dark', icon: <IconMoonStars size={30} /> },
	{ labelKey: 'theme.auto', value: 'auto', icon: <IconBrightnessFilled size={30} /> },
];

const DENSITIES: { labelKey: string, descriptionKey: string, value: Density, icon: React.ReactNode }[] = [
	{
		labelKey: 'density.spacious',
		descriptionKey: 'density.spacious.description',
		value: 'spacious',
		icon: <IconBaselineDensityMedium size={30} />,
	},
	{
		labelKey: 'density.compact',
		descriptionKey: 'density.compact.description',
		value: 'compact',
		icon: <IconBaselineDensitySmall size={30} />,
	},
];

/** Lets a tile's description wrap: Mantine keeps a button label on one line. */
const WRAPPING_LABEL = { label: { whiteSpace: 'normal' } } as const;

export const ThemeSwitchModal = forwardRef((props, ref) => {
	const t = useTranslate('common');
	const [opened, { open, close }] = useDisclosure(false);

	useImperativeHandle(ref, () => ({
		open,
		close,
	}));

	return (
		<Modal.Root centered opened={opened} onClose={close}>
			<Modal.Overlay />
			<Modal.Content radius={'md'}>
				<Modal.Header>
					<Modal.Title className='flex justify-between items-center' w={'100%'}>
						<Text w={'100%'} size='xl' fw={700} ta='center'>{t('profile.themeMode')}</Text>
						<Modal.CloseButton />
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Stack align='center' gap='md'>
						<Flex justify='center' align='center' mih={100}>
							<ThemeSwitcher/>
						</Flex>
						<Divider w='100%' />
						<Text fw={700} ta='center'>{t('profile.density')}</Text>
						<DensitySwitcher/>
					</Stack>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});

function ThemeSwitcher(): React.ReactNode {
	const t = useTranslate('common');
	const { themeMode, setThemeMode } = useThemeMode();
	const persistSetting = usePersistEssentialSetting();

	const handleSelect = (mode: ThemeMode) => {
		if (mode === themeMode) return;
		setThemeMode(mode);
		void persistSetting('theme_mode', mode, 'theme.saveFailed');
	};

	return (
		<Flex gap='md'>
			{THEMES.map((theme) => (
				<Button
					key={theme.value}
					variant={theme.value === themeMode ? 'light' : 'default'}
					h={80} w={80} p={0} radius='sm'
					onClick={() => handleSelect(theme.value)}
					{...testAttrs(TEST_ID, 'option', theme.value)}
				>
					<Flex direction='column' align='center' gap={4}>
						{theme.icon}
						<Text size='sm' fw={700} ta='center'>{t(theme.labelKey)}</Text>
					</Flex>
				</Button>
			))}
		</Flex>
	);
}

function DensitySwitcher(): React.ReactNode {
	const t = useTranslate('common');
	const { density, setDensity } = useDensity();
	const persistSetting = usePersistEssentialSetting();

	const handleSelect = (next: Density) => {
		if (next === density) return;
		setDensity(next);
		void persistSetting('density', next, 'density.saveFailed');
	};

	return (
		<Flex gap='md' justify='center' wrap='wrap'>
			{DENSITIES.map((option) => (
				<Button
					key={option.value}
					variant={option.value === density ? 'light' : 'default'}
					h='auto' w={180} py='sm' px='sm' radius='sm'
					styles={WRAPPING_LABEL}
					aria-pressed={option.value === density}
					onClick={() => handleSelect(option.value)}
					{...testAttrs(TEST_ID, 'density', option.value)}
				>
					<Stack align='center' gap={4}>
						{option.icon}
						<Text size='sm' fw={700} ta='center'>{t(option.labelKey)}</Text>
						<Text size='xs' c='dimmed' ta='center'>{t(option.descriptionKey)}</Text>
					</Stack>
				</Button>
			))}
		</Flex>
	);
}

/**
 * Saves one of the user's `essential.*` settings, so the choice follows them to the next sign-in.
 *
 * The local choice is applied first and kept when the save fails -- for instance when a tenant
 * policy forbids a user override. It then lasts until the next sign-in brings the stored value.
 */
function usePersistEssentialSetting(): (name: string, value: string, failureKey: string) => Promise<void> {
	const t = useTranslate('common');
	const isAuthenticated = useIsAuthenticated();
	const { notification } = useUIState();
	const { publish } = useShellCommand(SETTINGS_SET_COMMAND);

	return useCallback(async (name: string, value: string, failureKey: string) => {
		if (!isAuthenticated) return;
		const response = await publish({
			level: 'user',
			moduleKey: 'essential',
			items: [{ name, value }],
		});
		if (response.error != null || response.result?.clientErrors?.length) {
			notification.showError(t(failureKey), t('messages.error'));
		}
	}, [isAuthenticated, notification, publish, t]);
}
