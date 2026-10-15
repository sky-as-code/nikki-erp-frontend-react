import { Group, Stack, Text } from '@mantine/core';
import { ErrorBoundary } from '@nikkierp/ui/components';
import { usePaperBgColor } from '@nikkierp/ui/theme';
import clsx from 'clsx';
import React from 'react';
import { Outlet } from 'react-router';


import classes from './PublicLayout.module.css';
import { LangSwitchDropdown } from '../../components/LangSwitch';
import { ScrollableContent } from '../../components/ScrollableContent';
import { ThemeSwitchDropdown } from '../../components/ThemeSwitch';


export function PublicLayout(): React.ReactNode {
	return (
		<ErrorBoundary>
			<Stack gap={0} h='100vh' bg='var(--nikki-color-linear-page-background)'>
				<Header />
				<ScrollableContent>
					<Outlet />
				</ScrollableContent>
				<Footer />
			</Stack>
		</ErrorBoundary>
	);
};

const Header: React.FC = () => {
	const bg = usePaperBgColor();

	return (
		<Group
			component='header'align='center' justify='flex-end'
			h={50} gap={0} bg={bg}
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

/** `--nikki-color-white` is a literal white in both schemes; the footer needs a surface colour. */
const FOOTER_BG = 'light-dark(var(--nikki-color-white), var(--mantine-color-dark-7))';

const Footer: React.FC = () => {
	return (
		<Group bg={FOOTER_BG} component='footer' align='center' justify='center' h={30}>
			<Text c='dimmed' fz='sm'>
				Copyright © 2026 Nikki ERP
			</Text>
		</Group>
	);
};

