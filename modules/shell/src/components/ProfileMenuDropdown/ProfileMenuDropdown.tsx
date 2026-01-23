import { Avatar, Box, Divider, Flex, Menu, Text } from '@mantine/core';
import { signOutAction } from '@nikkierp/shell/auth';
import { IconBrightnessFilled, IconLogout2, IconSettings, IconUser, IconUserFilled, IconUsers } from '@tabler/icons-react';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import classes from './ProfileMenuDropdown.module.css';
import { ThemeSwitchModal } from '../ThemeSwitch';


export const ProfileMenuDropdown: React.FC = () => {
	const dispatch = useDispatch<any>();
	const { t: translate } = useTranslation();
	const themeModeModalRef = useRef<any>(null);

	const [opened, setOpened] = useState<boolean>(false);

	const handleLogout = () => {
		dispatch(signOutAction());
	};

	return (
		<>
			<Menu shadow='md' width={300} opened={opened} onChange={setOpened}>
				<Menu.Target>
					<Avatar size={35} className={clsx(classes.avatar, opened && classes.activeAvatar)}>
						<IconUserFilled color={'var(--mantine-color-gray-6)'} />
					</Avatar>
				</Menu.Target>

				<Menu.Dropdown className={classes.menuDropdown}>
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

					<Menu.Item leftSection={<IconUser size={20}/>}>
						{translate('nikki.shell.profileMenu.profile')}
					</Menu.Item>

					<Menu.Item leftSection={<IconSettings size={20}/>}>
						{translate('nikki.shell.profileMenu.accountSettings')}
					</Menu.Item>

					<Menu.Item
						onClick={() => themeModeModalRef?.current?.open()}
						leftSection={<IconBrightnessFilled size={20} />}
					>
						{translate('nikki.shell.profileMenu.themeMode')}
					</Menu.Item>

					<Divider my={4}/>

					<Menu.Item leftSection={<IconUsers size={20} />}>
						{translate('nikki.shell.profileMenu.switchAccount')}
					</Menu.Item>

					<Menu.Item onClick={handleLogout} leftSection={<IconLogout2 size={20} />}>
						{translate('nikki.shell.profileMenu.signOut')}
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
			<ThemeSwitchModal ref={themeModeModalRef} />
		</>
	);
};
