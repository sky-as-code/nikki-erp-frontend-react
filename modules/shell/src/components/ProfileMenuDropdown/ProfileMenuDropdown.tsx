import { Avatar, Button, Divider, Menu } from '@mantine/core';
import { signOutAction } from '@nikkierp/shell/auth';
import { IconBrightnessFilled, IconLogout2, IconUserCog, IconUserFilled } from '@tabler/icons-react';
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
			<Menu shadow='md' width={200} opened={opened} onChange={setOpened}>
				<Menu.Target>
					<Button h={35} p={0} variant={'outline'} className={clsx(classes.avatar)} bd={opened ? '1px solid var(--mantine-color-blue-6)' : '1px solid var(--mantine-color-gray-6)'}>
						<Avatar radius={'sm'} size={35} >
							<IconUserFilled color={opened ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-6)'} />
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
			<ThemeSwitchModal ref={themeModeModalRef} />
		</>
	);
};
