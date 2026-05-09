import {
	Box, Button, Divider, Flex, Group,
} from '@mantine/core';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { usePaperBgColor } from '@nikkierp/ui/theme';
import { IconCategoryFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { useLocation, useNavigate } from 'react-router';

import classes from './PrivateLayout.module.css';
import { MenuBar, MenuBarDrawer } from '../../components/MenuBar';
import { ModuleSwitchDropdown } from '../../components/ModuleSwitch';
import { NotificationDropdown } from '../../components/NotificationDropdown';
import { OrgSwitchDropdown } from '../../components/OrgSwitch';
import { ProfileMenuDrawer, ProfileMenuDropdown } from '../../components/ProfileMenu';


export const Header: React.FC = () => {
	const bg = usePaperBgColor();

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
				<Flex gap={'xs'} h='100%' align='center' justify='center'>
					<GoHomeButton />
					<Flex gap={'xs'} align='center' justify='center' h='100%'>
						<OrgSwitchDropdown hideIfEmpty dropdownWidth={300} />
						{!isRootPath && <>
							<ModuleSwitchDropdown hideIfEmpty dropdownWidth={300} />
							<Divider orientation='vertical' h={'100%'}/>
							<MenuBar />
						</>}
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
		<Group align='center' justify='space-between' w='100%' h='100%' gap={'xs'}>
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
	const [isAnimating, setIsAnimating] = React.useState(false);

	const handleClick = () => {
		setIsAnimating(true);
	};

	const handleAnimationEnd = () => {
		setIsAnimating(false);
		if (orgSlug) {
			navigate(`/${orgSlug}`);
		}
		else {
			navigate('/');
		}
	};

	return (
		<Button
			p={0}
			variant='transparent'
			onClick={handleClick}
			onAnimationEnd={handleAnimationEnd}
			className={clsx(classes.goHomeButton, isAnimating && classes.goHomeButtonClick)}
		>
			<IconCategoryFilled size={26} color={'var(--mantine-color-blue-6)'}/>
		</Button>
	);
};