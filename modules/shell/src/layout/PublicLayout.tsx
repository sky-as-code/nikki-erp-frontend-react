import { Box, Group, Stack, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';
import { Outlet } from 'react-router';

import { LangSwitchDropdown } from './LangSwitchDropDown';
import classes from './PublicLayout.module.css';
import { ThemeSwitchDropdown } from './ThemeSwitchDropDown';


export function PublicLayout(): React.ReactNode {

	return (
		<Stack gap={0} h='100vh'>
			<Stack gap={0} h='100vh'>
				<Header />
				<Box className={clsx( classes.mainPublicContent )} >
					<Outlet />
				</Box>
				<Footer />
			</Stack>
		</Stack>
	);
};


const Header: React.FC = () => {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	return (
		<Group
			component='header'
			align='center'
			justify='flex-end'
			h={50}
			gap={0}
			bg={bg}
			className={clsx( classes.headerRow )}
			px={'md'}
		>
			<Group component='section' align='center' justify='flex-end' gap='sm'>
				<ThemeSwitchDropdown/>
				<LangSwitchDropdown/>
			</Group>
		</Group>

	);
};

const Footer: React.FC = () => {
	return (
		<Group component='footer' align='center' justify='center' h={35}>
			{/* Footer content */}
		</Group>
	);
};

