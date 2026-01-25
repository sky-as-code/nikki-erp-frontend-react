import {
	Avatar,
	Box,
	Button,
	Center, Divider, Drawer, Flex, Group, Loader, Stack, Text,
	useMantineColorScheme, useMantineTheme,
} from '@mantine/core';
import { signOutAction, useAuthenticatedStatus } from '@nikkierp/shell/auth';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { AuthorizedGuard } from '@nikkierp/ui/components';
import { IconBrightnessFilled, IconCaretLeft, IconChevronLeft, IconChevronRight, IconLogout2, IconMenu2, IconSettings, IconUser, IconUserFilled, IconUsers, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router';

import classes from './PrivateLayout.module.css';

import { ContentContainer } from '@/components/ContentContainer';
import { MenuBar } from '@/components/MenuBar';
import { ModuleSwitchDropdown } from '@/components/ModuleSwitch';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { OrgSwitchDropdown } from '@/components/OrgSwitch';
import { ProfileMenuDropdown } from '@/components/ProfileMenuDropdown';
import { ThemeSwitchModal } from '@/components/ThemeSwitch';



export function PrivateLayout(): React.ReactNode {
	const status = useAuthenticatedStatus();

	return (!status || status.isSessionRestoring) ?
		<SessionRestoring/>
		: (
			<AuthorizedGuard>
				<Stack gap={0} h='100vh' miw={320}>
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
		<Box
			className={clsx( classes.headerRow )}
			h={50} px={'md'} py={5} bg={bg}
		>
			<Group
				component='header' align='center' justify='space-between'
				h='100%'
				display={{ base: 'none', md: 'flex' }} gap={0}
			>
				<Flex gap={0} h='100%' align='center'>
					{!isRootPath && <AllAppsButton />}
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
			<BurgerMenuButton />
			<OrgSwitchDropdown hideIfEmpty dropdownWidth={300} />
			<Group align='center' justify='flex-end' gap={4}>
				<NotificationDropdown />
				<ProfileMenuDrawer />
			</Group>
		</Group>
	);
};

const ProfileMenuDrawerContent: React.FC<{
	onClose: () => void;
	themeModeModalRef: React.RefObject<any>;
// eslint-disable-next-line max-lines-per-function
}> = ({ onClose, themeModeModalRef }) => {
	const dispatch = useDispatch<any>();
	const { t: translate } = useTranslation();

	const handleLogout = () => {
		dispatch(signOutAction());
		onClose();
	};

	return (
		<Stack gap={0}>
			<Flex gap={'sm'} p={'sm'} align='center' bg={'var(--mantine-color-gray-1)'}>
				<Avatar size={60}>
					<IconUserFilled color={'var(--mantine-color-gray-6)'} />
				</Avatar>
				<Box>
					<Text size='md' fw={600}>Display name</Text>
					<Text size='sm' c='dimmed'>username@example.com</Text>
				</Box>
			</Flex>

			<Divider my={4}/>

			<Button
				variant='subtle'
				justify='flex-start'
				leftSection={<IconUser size={20}/>}
				fullWidth
				c='var(--mantine-color-gray-7)'
				fw={500}
				fz={15}
				styles={{ inner: { justifyContent: 'flex-start' } }}
			>
				{translate('nikki.shell.profileMenu.profile')}
			</Button>

			<Button
				variant='subtle'
				justify='flex-start'
				leftSection={<IconSettings size={20}/>}
				fullWidth
				c='var(--mantine-color-gray-7)'
				fw={500}
				fz={15}
				styles={{ inner: { justifyContent: 'flex-start' } }}
			>
				{translate('nikki.shell.profileMenu.accountSettings')}
			</Button>

			<Button
				variant='subtle'
				justify='flex-start'
				leftSection={<IconBrightnessFilled size={20} />}
				fullWidth
				styles={{ inner: { justifyContent: 'flex-start' } }}
				c='var(--mantine-color-gray-7)'
				fw={500}
				fz={15}
				onClick={() => {
					themeModeModalRef?.current?.open();
					onClose();
				}}
			>
				{translate('nikki.shell.profileMenu.themeMode')}
			</Button>

			<Divider my={4}/>

			<Button
				variant='subtle'
				justify='flex-start'
				leftSection={<IconUsers size={20} />}
				fullWidth
				styles={{ inner: { justifyContent: 'flex-start' } }}
				c='var(--mantine-color-gray-7)'
				fw={500}
				fz={15}
			>
				{translate('nikki.shell.profileMenu.switchAccount')}
			</Button>

			<Button
				variant='subtle'
				justify='flex-start'
				leftSection={<IconLogout2 size={20} />}
				fullWidth
				styles={{ inner: { justifyContent: 'flex-start' } }}
				c='var(--mantine-color-gray-7)'
				fw={500}
				fz={15}
				onClick={handleLogout}
			>
				{translate('nikki.shell.profileMenu.signOut')}
			</Button>
		</Stack>
	);
};

const ProfileMenuDrawer: React.FC = () => {
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
					<Button variant='transparent' p={'xs'}
						color='var(--mantine-color-gray-6)'
						onClick={() => setDrawerOpened(false)}
					>
						<IconChevronRight size={20} />
					</Button>
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

const BurgerMenuButton: React.FC = () => {
	const navigate = useNavigate();
	const [drawerOpened, setDrawerOpened] = useState(false);
	const themeModeModalRef = useRef<any>(null);

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
					<Flex justify='flex-end'>
						<Button variant='transparent' p={'xs'}
							color='var(--mantine-color-gray-6)'
							onClick={() => setDrawerOpened(false)}
						>
							<IconChevronLeft size={20} />
						</Button>
					</Flex>
					<Drawer.Body>
						<Button onClick={() => {
							setDrawerOpened(false);
							navigate('/');
						}}>All apps</Button>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>

			<ThemeSwitchModal ref={themeModeModalRef} />
		</>
	);
};

const AllAppsButton: React.FC = () => {
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
			className={classes.allAppsButton}
		>
			<IconCaretLeft size={24} stroke={2}/>
		</Button>
	);
};