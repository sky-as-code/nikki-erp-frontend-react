import { MantineColor } from '@mantine/core'
import { IconCircleDottedLetterN } from '@tabler/icons-react'

export type NikkiModule = {
	color?: MantineColor
	icon?: typeof IconCircleDottedLetterN
	label: string
	slug: string
}

export type User = {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	orgs: Organization[];
}

export type Organization = {
	id: string;
	logo?: string | typeof IconCircleDottedLetterN; // image path or an icon
	name: string;
	slug: string;
}

export type UserSettings = {
	core: Record<string, any>
	modules: NikkiModule[],
	orgs: Organization[],
	system: Record<string, any>
}

export type UserPreference = {
	org?: string,
}