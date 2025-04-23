import { MantineColor } from '@mantine/core';
import { IconCircleDottedLetterN } from '@tabler/icons-react';

export type NikkiModule = {
	color?: MantineColor
	icon?: typeof IconCircleDottedLetterN
	label: string
	slug: string
};

export type User = {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	orgs: Organization[];
};

export function defaultOrg(user: User): Organization {
	return user.orgs.find((org) => org.isDefault) || user.orgs[0];
}

export type Organization = {
	id: string;
	name: string;
	slug: string;
	isDefault: boolean;
};

export type UserSettings = {
	core: Record<string, any>
	system: Record<string, any>
};