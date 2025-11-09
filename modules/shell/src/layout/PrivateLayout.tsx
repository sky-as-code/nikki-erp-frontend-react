import {
	Avatar, Box, Breadcrumbs, Center, Group, Loader, Stack, Text,
	useMantineColorScheme, useMantineTheme,
} from '@mantine/core';
import { useAuthenticatedStatus } from '@nikkierp/shell/auth';
import { AuthorizedGuard } from '@nikkierp/ui/components';
import { IconUserFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Outlet } from 'react-router';

import { MenuBar } from './MenuBar';
import { ModuleSwitchDropdown } from './ModuleSwitchDropdown';
import { OrgSwitchDropdown } from './OrgSwitchDropdown';
import classes from './RootLayout.module.css';


export function PrivateLayout(): React.ReactNode {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const status = useAuthenticatedStatus();

	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	return status && !status.isSessionRestoring ? (
		<AuthorizedGuard>
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
		</AuthorizedGuard>
	) : (
		<Center w='100%' h='90vh'>
			<Stack align='center' gap='xs'>
				<Loader />
				<Text c='dimmed'>Restoring your session...</Text>
			</Stack>
		</Center>
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
			<Group
				component='section'
				align='center'
				justify='flex-start'
				gap={0}
				className={'flex flex-row items-center justify-start'}
			>
				<Breadcrumbs separatorMargin='xs'>
					<OrgSwitchDropdown hideIfEmpty dropdownWidth={300} />
					<ModuleSwitchDropdown hideIfEmpty dropdownWidth={300} />
				</Breadcrumbs>
				{/* <MenuBar items={navItems} /> */}
				<MenuBar />
			</Group>
			<Group component='section' align='center' justify='flex-end' gap='sm'>
				<Avatar size={35}>
					<IconUserFilled />
				</Avatar>
			</Group>
		</Group>
	);
};
