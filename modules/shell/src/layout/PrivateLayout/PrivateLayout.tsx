import {
	Box, Breadcrumbs, Button, Center, Flex, Group, Loader, Stack, Text,
	useMantineColorScheme, useMantineTheme,
} from '@mantine/core';
import { useAuthenticatedStatus } from '@nikkierp/shell/auth';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { AuthorizedGuard } from '@nikkierp/ui/components';
import { IconBrandBlackberry, IconChevronLeft } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import classes from './PrivateLayout.module.css';
import { LangSwitchDropdown } from '../../components/LangSwitch';
import { ModuleSwitchDropdown } from '../../components/ModuleSwitch';
import { NotificationDropdown } from '../../components/NotificationDropdown';
import { OrgSwitchDropdown } from '../../components/OrgSwitch';
import { ProfileMenuDropdown } from '../../components/ProfileMenuDropdown';



export function PrivateLayout(): React.ReactNode {
	const status = useAuthenticatedStatus();

	return status && !status.isSessionRestoring ? (
		<AuthorizedGuard>
			<AuthorizedGuard>
				<Stack gap={0} h='100vh'>
					<Header />

					<Box className={clsx( classes.mainPrivateContent )} >
						<Outlet />
					</Box>
				</Stack>
			</AuthorizedGuard>
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

const DomainLogoButton: React.FC<{ isRootPath: boolean }> = ({ isRootPath }) => {
	const navigate = useNavigate();

	return (
		<Button
			className={classes.iconButton}
			h={'100%'}
			variant='transparent'
			p={0}
			onClick={() => {
				navigate(`/`);
			}}
		>
			<Flex align='center' justify='center' gap={2} style={{ minWidth: 'auto', position: 'relative' }}>
				<IconChevronLeft
					size={26}
					className={clsx(classes.iconHome, isRootPath && classes.iconHidden)}
					style={{ flexShrink: 0, transition: 'opacity 0.2s ease, transform 0.2s ease' }}
				/>
				<IconBrandBlackberry
					size={30}
					className={clsx(classes.iconBrand)}
					style={{ flexShrink: 0, transition: 'opacity 0.2s ease, transform 0.2s ease' }}
				/>
			</Flex>
		</Button>
	);
};


