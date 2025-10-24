import { Button, createTheme, CSSVariablesResolver, MantineThemeOverride, ActionIcon } from '@mantine/core';


export const theme = createTheme({
	fontFamily: 'Space Grotesk, sans-serif',
	headings: { fontFamily: 'Space Grotesk, sans-serif' },
	// colors: {
	// 	primary: [
	// 		'#eaf3fb',
	// 		'#d3e3f5',
	// 		'#accbed',
	// 		'#80afe1',
	// 		'#5492d3',
	// 		'#347dc3',
	// 		'#2a73b9',
	// 		'#2b5fa6',
	// 		'#2a3b90',
	// 		'#1e276c',
	// 	],
	// },
	// primaryColor: 'primary',
	defaultRadius: 'md',
	components: {
		ActionIcon: ActionIcon.extend({
			vars: (theme, props) => {
				return {
					root: {
						'--ai-hover': 'var(--nikki-color-white-bg-hover)',
					},
				};
			},
		}),
		Button: Button.extend({
			vars: (theme, props) => {
				return {
					root: {
						'--button-hover': 'var(--nikki-color-white-bg-hover)',
					},
				};
			},
		}),
	},
});

export const resolver: CSSVariablesResolver = (theme: MantineThemeOverride) => ({
	variables: {
		'--mantine-color-blue-outline-hover': 'var(--mantine-color-dark-light-hover)',
	},
	light: {
	},
	dark: {
	},
});