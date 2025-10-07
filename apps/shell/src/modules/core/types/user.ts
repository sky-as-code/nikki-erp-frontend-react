import { Organization } from './organization'

import { NikkiModule } from '.'

export type User = {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	orgs: Organization[];
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