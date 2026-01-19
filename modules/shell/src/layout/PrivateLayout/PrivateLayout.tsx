import {
	Breadcrumbs, Center, Group, Loader, Stack, Text,
	useMantineColorScheme, useMantineTheme,
} from '@mantine/core';
import { useAuthenticatedStatus } from '@nikkierp/shell/auth';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { AuthorizedGuard } from '@nikkierp/ui/components';
import clsx from 'clsx';
import React from 'react';
import { Outlet, useLocation } from 'react-router';

import { ContentContainer } from '@/components/ContentContainer';
import { DomainLogoButton } from '@/components/DomainLogo';
import { LangSwitchDropdown } from '@/components/LangSwitch';
import { ModuleSwitchDropdown } from '@/components/ModuleSwitch';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { OrgSwitchDropdown } from '@/components/OrgSwitch';
import { ProfileMenuDropdown } from '@/components/ProfileMenuDropdown';

import classes from './PrivateLayout.module.css';



export function PrivateLayout(): React.ReactNode {
	const status = useAuthenticatedStatus();

	return (!status || status.isSessionRestoring) ?
		<SessionRestoring/>
		: (
			<AuthorizedGuard>
				<Stack gap={0} h='100vh'>
					<Header />
					<ContentContainer>
						<Outlet/>
					</ContentContainer>
				</Stack>
			</AuthorizedGuard>
		);
};


const SessionRestoring: React.FC = () => {
	return (
		<Center w='100%' h='90vh'>
			<Stack align='center' gap='xs'>
				<Loader />
				<Text c='dimmed'>Restoring your session...</Text>
			</Stack>
		</Center>
	);
};


const Header: React.FC = () => {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	const { pathname } = useLocation();
	const { orgSlug } = useActiveOrgModule();

	const isRootPath = pathname === `/${orgSlug ?? ''}` || pathname === '/';

	return (
		<Group
			component='header'
			align='center'
			justify='space-between'
			gap={0}
			bg={bg}
			h={50}
			py={5}
			px={'md'}
			className={clsx( classes.headerRow )}
		>
			<Group
				h={'100%'}
				align='center'
				justify='flex-start'
				gap={'xs'}
			>
				<DomainLogoButton isRootPath={isRootPath} />
				<Breadcrumbs h={'100%'}>
					<OrgSwitchDropdown hideIfEmpty dropdownWidth={300} />
					{!isRootPath && <ModuleSwitchDropdown hideIfEmpty dropdownWidth={300} />}
				</Breadcrumbs>
			</Group>

			<Group component='section' align='center' justify='flex-end' gap='sm'>
				<LangSwitchDropdown/>
				<NotificationDropdown />
				<ProfileMenuDropdown/>
			</Group>
		</Group>

	);
};


