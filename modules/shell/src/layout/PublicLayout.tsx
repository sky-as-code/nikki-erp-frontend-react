import { ActionIcon, Box, Group, Stack, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Outlet } from 'react-router';

import classes from './RootLayout.module.css';


export function PublicLayout(): React.ReactNode {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();

	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	return (
		<Stack
			component='div'
			bg={bg}
			gap={0}
			className='module-layout h-screen'
		>
			<Header />
			<Box component='main'>
				<Outlet />
			</Box>
		</Stack>
	);
};


const Header: React.FC = () => {
	// const { isMobile } = useUIState();

	// if (isMobile) return null;

	return (
		<Group
			component='header'
			align='center'
			justify='space-between'
			gap={0}
			className={clsx(
				'w-full h-[50px] shrink-0 z-100 px-4',
				classes.headerRow,
				classes.menuBar,
			)}
		>
			<Group component='section' align='center' justify='flex-end' gap='sm'>
				<ActionIcon variant='subtle' size='compact-md'>
					<IconSettings size={30} />
				</ActionIcon>
			</Group>
		</Group>
	);
};
