'use client';

import { Button, useMantineColorScheme } from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons-react';


export const ThemeSwitcher: React.FC = () => {
	const { colorScheme, setColorScheme } = useMantineColorScheme();
	return (
		<Button
			variant='subtle'
			size='compact-md'
		>
			{(colorScheme === 'dark') && <IconMoonStars onClick={() => setColorScheme('light')} />}
			{(colorScheme === 'light') && <IconSun onClick={() => setColorScheme('dark')} />}
		</Button>
	);
};


// export const ThemeSwitcher = () => {
// 	const { colorScheme, setColorScheme } = useMantineColorScheme();

// 	return (
// 		<Radio.Group
// 			value={colorScheme}
// 			onChange={(value) => {
// 				setColorScheme(value as MantineColorScheme);
// 			}}
// 			name='theme'
// 			label='Theme Mode'
// 		>
// 			<Group mt='sm'>
// 				<Radio value='light' label='Light' />
// 				<Radio value='dark' label='Dark' />
// 			</Group>
// 		</Radio.Group>
// 	);
// };