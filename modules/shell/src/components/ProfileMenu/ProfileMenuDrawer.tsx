import {
	Avatar,
	Box,
	Button,
	Divider, Drawer, Flex, Stack, Text,
} from '@mantine/core';
import { IconUserFilled, IconX } from '@tabler/icons-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { ThemeSwitchModal } from '@/components/ThemeSwitch';

import { handleMenuItemClick } from './helpers';
import { PROFILE_MENU_CONFIG } from './menuConfig';


export const ProfileMenuDrawer: React.FC = () => {
	const [drawerOpened, setDrawerOpened] = useState(false);
	const themeModeModalRef = useRef<any>(null);

	return (
		<>
			<Avatar
				size={35}
				onClick={() => setDrawerOpened(!drawerOpened)}
			>
				<IconUserFilled color={'var(--mantine-color-gray-6)'} />
			</Avatar>

			<Drawer.Root
				opened={drawerOpened}
				onClose={() => setDrawerOpened(false)}
				position='right'
				size={'md'}
				offset={8} radius='md'
			>
				<Drawer.Overlay opacity={0.6} blur={4}/>
				<Drawer.Content>
					<Flex justify='flex-end' p={4}>
						<Button variant='transparent'
							color='var(--mantine-color-gray-6)'
							h={24} w={24} p={2}
							onClick={() => setDrawerOpened(false)}
						>
							<IconX size={20} />
						</Button>
					</Flex>
					<Drawer.Body>
						<ProfileMenuDrawerContent
							onClose={() => setDrawerOpened(false)}
							themeModeModalRef={themeModeModalRef}
						/>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>

			<ThemeSwitchModal ref={themeModeModalRef} />
		</>
	);
};




type ProfileMenuDrawerContentProps = {
	onClose: () => void;
	themeModeModalRef: React.RefObject<any>;
};

const ProfileMenuDrawerContent: React.FC<ProfileMenuDrawerContentProps> = ({ onClose, themeModeModalRef }) => {
	const dispatch = useDispatch<any>();
	const { t: translate } = useTranslation();

	return (
		<Stack gap={0}>
			<Flex gap={'sm'} p={'sm'} align='center' bg={'var(--mantine-color-gray-1)'} mb='sm'>
				<Avatar size={60}>
					<IconUserFilled color={'var(--mantine-color-gray-6)'} />
				</Avatar>
				<Box>
					<Text size='md' fw={600}>Display name</Text>
					<Text size='sm' c='dimmed'>username@example.com</Text>
				</Box>
			</Flex>

			{PROFILE_MENU_CONFIG.map((item) => {
				if (item.type === 'divider') {
					return <Divider key={item.id} my={4} />;
				}

				return (
					<Button
						key={item.id}
						variant='subtle'
						justify='flex-start'
						leftSection={item.icon}
						fullWidth
						c='var(--mantine-color-gray-7)'
						fw={500}
						fz={15}
						styles={{ inner: { justifyContent: 'flex-start' } }}
						onClick={() => handleMenuItemClick(item.action, dispatch, themeModeModalRef, onClose)}
					>
						{translate(item.translationKey)}
					</Button>
				);
			})}
		</Stack>
	);
};

