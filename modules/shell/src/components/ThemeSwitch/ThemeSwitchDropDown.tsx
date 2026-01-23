import { Box, Button, Menu, Text, useMantineColorScheme } from '@mantine/core';
import { IconBrightnessFilled, IconChevronDown, IconMoonStars, IconSun } from '@tabler/icons-react';


export const ThemeSwitchDropdown: React.FC = () => {
	const { colorScheme, setColorScheme } = useMantineColorScheme();

	const themes = [
		{ label: 'Light', value: 'light', icon: <IconSun size={22} /> },
		{ label: 'Dark', value: 'dark', icon: <IconMoonStars size={22} /> },
		{ label: 'Auto', value: 'auto', icon: <IconBrightnessFilled size={22} /> },
	];

	const selectedTheme = themes.find((theme) => theme.value === colorScheme);

	const themItems = themes.map((theme) => (
		<Menu.Item
			key={theme.value}
			onClick={() => setColorScheme(theme.value as any)}
			leftSection={theme.icon}
		>
			<Text ta='left' ps={4}>{theme.label}</Text>
		</Menu.Item>
	));

	return (
		<Menu shadow='md' width={120} position='bottom-end'>
			<Menu.Target>
				<Button px={'xs'} variant='default' h={35}>
					<Box p={0} mx={3}>{ selectedTheme?.icon || <IconBrightnessFilled size={22} /> }</Box>
					<IconChevronDown size={18} color='var(--mantine-color-gray-7)' />
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				{ themItems }
			</Menu.Dropdown>
		</Menu>
	);
};