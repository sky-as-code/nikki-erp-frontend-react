import {
	Box, Divider, Flex, Group,
} from '@mantine/core';
import { usePaperBgColor } from '@nikkierp/ui/theme';
import clsx from 'clsx';
import React from 'react';
import { useLocation } from 'react-router';

import classes from './PrivateLayout.module.css';
import { GoHomeButton } from '../../components/GoHomeButton';
import { MenuBar, MenuBarDrawer } from '../../components/MenuBar';
import { HeaderPanelSlotContext } from '../../components/MenuBar/ribbon/headerPanelSlot';
import { ModuleSwitchDropdown } from '../../components/ModuleSwitch';
import { NotificationDropdown } from '../../components/NotificationDropdown';
import { OrgSwitchDropdown } from '../../components/OrgSwitch';
import { ProfileMenuDrawer, ProfileMenuDropdown } from '../../components/ProfileMenu';


export const Header: React.FC = () => {
	const bg = usePaperBgColor();
	const { pathname } = useLocation();
	const isRootPath = pathname === '/';
	const [panelSlot, setPanelSlot] = React.useState<HTMLDivElement | null>(null);

	// Only the row is 50px: a pinned ribbon grows the header below it, and the page under the
	// header (a flex-1 sibling in PrivateLayout) gives up that height.
	return (
		<HeaderPanelSlotContext.Provider value={panelSlot}>
			<Box className={classes.header} bg={bg}>
				<Box className={clsx(classes.headerRow)} h={50} px={'md'} py={5}>
					<Group
						component='header' align='center' justify='space-between'
						display={{ base: 'none', md: 'flex' }} gap={0} h='100%'
					>
						{/* The left side takes the free width so the menu bar can measure what fits in it. */}
						<Flex gap={'xs'} h='100%' align='center' flex={1} miw={0}>
							<GoHomeButton testId='shell.header.allApps' />
							<Flex gap={'xs'} align='center' h='100%' flex={1} miw={0}>
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
				{/* Desktop only: the mobile header has no ribbon, its drawer renders the menu instead. */}
				<Box ref={setPanelSlot} display={{ base: 'none', md: 'block' }} />
			</Box>
		</HeaderPanelSlotContext.Provider>
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
