import {
	Button,
	Divider, Drawer, Flex, Stack,
} from '@mantine/core';
import { IconMenu2, IconX } from '@tabler/icons-react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';


import { MenuBar } from '@/components/MenuBar';

import { ThemeSwitchModal } from '../ThemeSwitch';


export const MenuBarDrawer: React.FC = () => {
	const navigate = useNavigate();
	const [drawerOpened, setDrawerOpened] = useState(false);
	const themeModeModalRef = useRef<any>(null);

	const handleItemClick = (link?: string) => {
		if (link) {
			navigate(link);
		}
		setDrawerOpened(false);
	};

	return (
		<>
			<Button variant='light' size='sm' px={'xs'} onClick={() => setDrawerOpened(!drawerOpened)}>
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
							color='var(--mantine-color-gray-6)'
							h={24}
							w={24}
							p={2}
							onClick={() => setDrawerOpened(false)}
						>
							<IconX size={20} />
						</Button>
					</Flex>
					<Drawer.Body>
						<Stack gap={0}>
							<Button
								variant='subtle'
								justify='flex-start'
								fullWidth
								pl={12}
								pr={12}
								py={8}
								c='var(--mantine-color-gray-7)'
								fw={500}
								fz={15}
								styles={{ inner: { justifyContent: 'flex-start' } }}
								onClick={() => {
									setDrawerOpened(false);
									navigate('/');
								}}
							>
								All apps
							</Button>
							<Divider my={8} />
							<MenuBar mode='vertical' onItemClick={handleItemClick} />
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
			<ThemeSwitchModal ref={themeModeModalRef} />
		</>
	);
};