import { useMantineColorScheme, useMantineTheme } from '@mantine/core';


export function usePaperBgColor(): string {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	return colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];
}
