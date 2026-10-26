import {
	Box, Button, Divider, Drawer, Flex, Group, Stack,
} from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { IconMenu2, IconX } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { MENU_BAR_TEST_ID } from './helper';
import { MenuBar } from './MenuBar';
import { GoHomeButton } from '../GoHomeButton';
import { ModuleSwitchDropdown } from '../ModuleSwitch';
import { ThemeSwitchModal } from '../ThemeSwitch';




export const MenuBarDrawer: React.FC = () => {
	const { pathname } = useLocation();
	const [drawerOpened, setDrawerOpened] = useState(false);
	const themeModeModalRef = useRef<any>(null);
	const isRootPath = pathname === '/';

	// Any navigation from inside -- a menu link, the module switch, all apps -- lands the user on the
	// new page rather than leaving the drawer over it.
	useEffect(() => setDrawerOpened(false), [pathname]);

	return (
		<>
			<Button
				variant='light' size='sm' px={'xs'} onClick={() => setDrawerOpened(!drawerOpened)}
				{...testAttrs(MENU_BAR_TEST_ID, 'drawerToggle')}
			>
				{drawerOpened ? <IconX /> : <IconMenu2 />}
			</Button>

			<Drawer.Root
				opened={drawerOpened}
				onClose={() => setDrawerOpened(false)}
				position='left'
				size={'md'}
				offset={8} radius='md'
			>
				<Drawer.Overlay opacity={0.6} blur={4}/>
				<Drawer.Content>
					<Flex justify='flex-end' p={4}>
						<Button variant='transparent'
							color='var(--mantine-color-gray-6)' h={24} w={24} p={2}
							onClick={() => setDrawerOpened(false)}
							{...testAttrs(MENU_BAR_TEST_ID, 'drawerClose')}
						>
							<IconX size={20} />
						</Button>
					</Flex>
					<Drawer.Body>
						<Stack gap={0}>
							<Group gap='xs' wrap='nowrap' align='center'>
								<GoHomeButton testId={`${MENU_BAR_TEST_ID}.allApps`} />
								{!isRootPath && (
									<Box flex={1} miw={0}>
										<ModuleSwitchDropdown hideIfEmpty dropdownWidth={300} />
									</Box>
								)}
							</Group>
							<Divider my={8} />
							<MenuBar mode='vertical' />
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
			<ThemeSwitchModal ref={themeModeModalRef} />
		</>
	);
};