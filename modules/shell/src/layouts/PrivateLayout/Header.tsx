import {
	Box,
	Button,
	Flex, Group,
	useMantineColorScheme, useMantineTheme,
} from '@mantine/core';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { IconCaretLeft } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { useLocation, useNavigate } from 'react-router';


import { MenuBar, MenuBarDrawer } from '@/components/MenuBar';
import { ModuleSwitchDropdown } from '@/components/ModuleSwitch';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { OrgSwitchDropdown } from '@/components/OrgSwitch';
import { ProfileMenuDrawer, ProfileMenuDropdown } from '@/components/ProfileMenu';

import classes from './PrivateLayout.module.css';


export const Header: React.FC = () => {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const bg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

	const { pathname } = useLocation();
	const { orgSlug } = useActiveOrgModule();

	const isRootPath = pathname === `/${orgSlug ?? ''}` || pathname === '/';

	return (
		<Box className={clsx( classes.headerRow )}
			h={50} px={'md'} py={5} bg={bg}
		>
			<Group
				component='header' align='center' justify='space-between'
				display={{ base: 'none', md: 'flex' }} gap={0} h='100%'
			>
				<Flex gap={0} h='100%' align='center'>
					{!isRootPath && <GoHomeButton />}
					<Flex gap={'xs'} align='center' justify='flex-start'>
						<OrgSwitchDropdown hideIfEmpty dropdownWidth={300} />
						{!isRootPath && <ModuleSwitchDropdown hideIfEmpty dropdownWidth={300} />}
						<MenuBar />
					</Flex>
				</Flex>

				<Flex align='center' justify='flex-end' gap={6}>
					<NotificationDropdown />
					<ProfileMenuDropdown />
				</Flex>
			</Group>

			<Box display={{ base: 'flex', md: 'none' }} w='100%' h='100%'>
				<HeaderMobile />
			</Box>
		</Box>
	);
};

const HeaderMobile: React.FC = () => {
	return (
		<Group align='center' justify='space-between' w='100%' h='100%'>
			<MenuBarDrawer />
			<OrgSwitchDropdown hideIfEmpty dropdownWidth={300} />
			<Group align='center' justify='flex-end' gap={4}>
				<NotificationDropdown />
				<ProfileMenuDrawer />
			</Group>
		</Group>
	);
};


const GoHomeButton: React.FC = () => {
	const navigate = useNavigate();
	const { orgSlug } = useActiveOrgModule();

	const handleClick = () => {
		if (orgSlug) {
			navigate(`/${orgSlug}`);
		}
		else {
			navigate('/');
		}
	};

	return (
		<Button
			p={0} mb={2}
			variant='transparent'
			onClick={handleClick}
			className={classes.goHomeButton}
		>
			<IconCaretLeft size={24} stroke={2}/>
		</Button>
	);
};