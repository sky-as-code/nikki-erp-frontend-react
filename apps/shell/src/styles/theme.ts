'use client';

import { createTheme } from '@mantine/core';

export const theme = createTheme({
	fontFamily: 'Space Grotesk, sans-serif',
	headings: {fontFamily: 'Space Grotesk, sans-serif'},
	colors: {
		primary: [
			'#ecefff',
			'#d5dafb',
			'#a9b1f1',
			'#7a87e9',
			'#5362e1',
			'#3a4bdd',
			'#0078d4', // '#2c40dc', // Azure color
			'#1f32c4',
			'#182cb0',
			'#0a259c',
		],
	},
	primaryColor: 'primary',
	defaultRadius: 'md',
});
