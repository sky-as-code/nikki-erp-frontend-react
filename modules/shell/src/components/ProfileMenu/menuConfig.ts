import { IconBrightnessFilled, IconLogout2, IconSettings, IconUser, IconUsers } from '@tabler/icons-react';
import React from 'react';


export type MenuItemType = 'profile' | 'accountSettings' | 'themeMode' | 'divider' | 'switchAccount' | 'signOut';

export interface ProfileMenuItem {
	id: string;
	type: MenuItemType;
	icon?: React.ReactNode;
	translationKey: string;
	action?: 'themeMode' | 'signOut' | 'none';
}

export const PROFILE_MENU_CONFIG: ProfileMenuItem[] = [
	{
		id: 'profile',
		type: 'profile',
		icon: React.createElement(IconUser, { size: 20 }),
		translationKey: 'nikki.shell.profileMenu.profile',
		action: 'none',
	},
	{
		id: 'accountSettings',
		type: 'accountSettings',
		icon: React.createElement(IconSettings, { size: 20 }),
		translationKey: 'nikki.shell.profileMenu.accountSettings',
		action: 'none',
	},
	{
		id: 'themeMode',
		type: 'themeMode',
		icon: React.createElement(IconBrightnessFilled, { size: 20 }),
		translationKey: 'nikki.shell.profileMenu.themeMode',
		action: 'themeMode',
	},
	{
		id: 'divider1',
		type: 'divider',
		translationKey: '',
	},
	{
		id: 'switchAccount',
		type: 'switchAccount',
		icon: React.createElement(IconUsers, { size: 20 }),
		translationKey: 'nikki.shell.profileMenu.switchAccount',
		action: 'none',
	},
	{
		id: 'signOut',
		type: 'signOut',
		icon: React.createElement(IconLogout2, { size: 20 }),
		translationKey: 'nikki.shell.profileMenu.signOut',
		action: 'signOut',
	},
];

