import { Box, Button, Menu, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { ThemeMode, useThemeMode } from '@nikkierp/shell/userContext';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconBrightnessFilled, IconChevronDown, IconMoonStars, IconSun } from '@tabler/icons-react';


const TEST_ID = 'shell.themeSwitch';

export const ThemeSwitchDropdown: React.FC = () => {
	const t = useTranslate('common');
	const { themeMode, setThemeMode } = useThemeMode();

	const themes: { label: string, value: ThemeMode, icon: React.ReactNode }[] = [
		{ label: t('theme.light'), value: 'light', icon: <IconSun size={22} /> },
		{ label: t('theme.dark'), value: 'dark', icon: <IconMoonStars size={22} /> },
		{ label: t('theme.auto'), value: 'auto', icon: <IconBrightnessFilled size={22} /> },
	];

	const selectedTheme = themes.find((theme) => theme.value === themeMode);

	const themItems = themes.map((theme) => (
		<Menu.Item
			key={theme.value}
			onClick={() => setThemeMode(theme.value)}
			leftSection={theme.icon}
			{...testAttrs(TEST_ID, 'option', theme.value)}
		>
			<Text ta='left' ps={4}>{theme.label}</Text>
		</Menu.Item>
	));

	return (
		<Menu shadow='md' width={120} position='bottom-end'>
			<Menu.Target>
				<Button px={'xs'} variant='default' h={35} {...testAttrs(TEST_ID, 'trigger')}>
					<Box p={0} mx={3}>{ selectedTheme?.icon || <IconBrightnessFilled size={22} /> }</Box>
					<IconChevronDown size={18} color='var(--mantine-color-dimmed)' />
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				{ themItems }
			</Menu.Dropdown>
		</Menu>
	);
};