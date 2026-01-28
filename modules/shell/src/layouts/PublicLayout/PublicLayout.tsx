import {  Group, Stack, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';
import { Outlet } from 'react-router';

import classes from './PublicLayout.module.css';

import { LangSwitchDropdown } from '@/components/LangSwitch';
import { ScrollableContent } from '@/components/ScrollableContent';
import { ThemeSwitchDropdown } from '@/components/ThemeSwitch';





export function PublicLayout(): React.ReactNode {
	return (
		<Stack gap={0} h='100vh' bg='var(--nikki-color-linear-page-background)'>
			<Header />
			<ScrollableContent>
				<Outlet />
			</ScrollableContent>
			<Footer />
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
		<Group bg={'var(--nikki-color-white)'} component='footer' align='center' justify='center' h={30}>
			<Text c='dimmed' fz='sm'>
				Copyright © 2026 Nikki ERP
			</Text>
		</Group>
	);
};

