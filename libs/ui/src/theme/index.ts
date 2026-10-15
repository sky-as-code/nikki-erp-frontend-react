import { useComputedColorScheme, useMantineTheme } from '@mantine/core';


/**
 * Resolved, not stored: `useMantineColorScheme().colorScheme` is the user's choice, usually `auto`,
 * which never equals `dark` -- so a device set to dark got light surfaces.
 */
export function usePaperBgColor(): string {
	const colorScheme = useComputedColorScheme('light');
	const theme = useMantineTheme();
	return colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];
}
