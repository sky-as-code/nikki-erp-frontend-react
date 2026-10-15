import { Flex, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { testAttrs } from '@nikkierp/common/utils';
import { useIsAuthenticated } from '@nikkierp/shell/authenticate';
import { useShellCommand } from '@nikkierp/shell/commandBus';
import { useUIState } from '@nikkierp/shell/contexts';
import { ThemeMode, useThemeMode } from '@nikkierp/shell/userContext';
import { Button } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconBrightnessFilled, IconMoonStars, IconSun } from '@tabler/icons-react';
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
					<Flex justify='center' align='center' mih={150}>
						<ThemeSwitcher/>
					</Flex>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});

function ThemeSwitcher(): React.ReactNode {
	const t = useTranslate('common');
	const { themeMode, setThemeMode } = useThemeMode();
	const persistThemeMode = usePersistThemeMode();

	const handleSelect = (mode: ThemeMode) => {
		if (mode === themeMode) return;
		setThemeMode(mode);
		void persistThemeMode(mode);
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

/**
 * Saves the choice as the user's `essential.theme_mode`, so it follows them to the next sign-in.
 *
 * The local choice is applied first and kept when the save fails -- for instance when a tenant
 * policy forbids a user override. It then lasts until the next sign-in brings the stored value.
 */
function usePersistThemeMode(): (mode: ThemeMode) => Promise<void> {
	const t = useTranslate('common');
	const isAuthenticated = useIsAuthenticated();
	const { notification } = useUIState();
	const { publish } = useShellCommand(SETTINGS_SET_COMMAND);

	return useCallback(async (themeMode: ThemeMode) => {
		if (!isAuthenticated) return;
		const response = await publish({
			level: 'user',
			moduleKey: 'essential',
			items: [{ name: 'theme_mode', value: themeMode }],
		});
		if (response.error != null || response.result?.clientErrors?.length) {
			notification.showError(
				t('theme.saveFailed'),
				t('messages.error'),
			);
		}
	}, [isAuthenticated, notification, publish, t]);
}
