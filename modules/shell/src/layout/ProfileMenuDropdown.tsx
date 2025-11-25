import { Avatar, Button, Divider, Menu } from '@mantine/core';
import { signOutAction } from '@nikkierp/shell/auth';
import { IconBrightnessFilled, IconLogout2, IconUserCog, IconUserFilled } from '@tabler/icons-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import classes from './RootLayout.module.css';
import { ThemeModeSwitchModal } from './ThemeModeSwitchModal';


export const ProfileMenuDropdown: React.FC = () => {
	const { t: translate } = useTranslation();

	const themeModeModalRef = useRef<any>(null);

	const dispatch = useDispatch<any>();

	const handleLogout = () => {
		dispatch(signOutAction());
	};

	return (
		<>
			<Menu shadow='md' width={200}>
				<Menu.Target>
					<Button w={35} h={35} p={0} variant='transparent' className={classes.avatar}>
						<Avatar variant='transparent' radius={'sm'} size={35}>
							<IconUserFilled />
						</Avatar>
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Item onClick={() => themeModeModalRef?.current?.open()} leftSection={<IconBrightnessFilled size={20} />}> {translate('nikki.general.labels.darkLightMode')}</Menu.Item>
					<Menu.Item leftSection={<IconUserCog size={20}/>}> {translate('nikki.general.labels.myAccount')}</Menu.Item>
					<Divider my={4}/>
					<Menu.Item  onClick={handleLogout} leftSection={<IconLogout2 size={20} />}> {translate('nikki.general.labels.signOut')}</Menu.Item>
				</Menu.Dropdown>
			</Menu>
			<ThemeModeSwitchModal ref={themeModeModalRef} />
		</>
	);
};
