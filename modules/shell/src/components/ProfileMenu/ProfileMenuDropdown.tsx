import { Avatar, Box, Divider, Flex, Menu, Text } from '@mantine/core';
import { IconUserFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { handleMenuItemClick } from './helpers';
import { PROFILE_MENU_CONFIG } from './menuConfig';
import classes from './ProfileMenuDropdown.module.css';
import { ThemeSwitchModal } from '../ThemeSwitch';


export const ProfileMenuDropdown: React.FC = () => {
	const dispatch = useDispatch<any>();
	const { t: translate } = useTranslation();
	const themeModeModalRef = useRef<any>(null);

	const [opened, setOpened] = useState<boolean>(false);

	return (
		<>
			<Menu shadow='md' width={300} opened={opened} onChange={setOpened}>
				<Menu.Target>
					<Avatar size={35} className={clsx(classes.avatar, opened && classes.activeAvatar)}>
						<IconUserFilled color={'var(--mantine-color-gray-6)'} />
					</Avatar>
				</Menu.Target>

				<Menu.Dropdown className={classes.menuDropdown} p={'xs'}>
					<Flex gap={'sm'} p={'sm'} mb={'sm'} align='center'
						bg={'var(--mantine-color-gray-1)'}
						style={{ borderRadius: '3px' }}
					>
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
							<Menu.Item
								key={item.id}
								leftSection={item.icon}
								onClick={() => handleMenuItemClick(item.action, dispatch, themeModeModalRef)}
							>
								{translate(item.translationKey)}
							</Menu.Item>
						);
					})}
				</Menu.Dropdown>
			</Menu>
			<ThemeSwitchModal ref={themeModeModalRef} />
		</>
	);
};
