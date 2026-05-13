export const SLICE_NAME = 'shell.userContext';
export const LOCAL_SETTINGS_STORAGE_KEY = `shell:userContext:settings`;

export type GetUserContextResponse = {
	id: string,
	avatar_url: string | null,
	display_name: string,
	email: string,
	entitlements: string[],
	orgs: UserContextOrg[],
	account_settings: {
		language: {
			id: string,
			name: string,
			iso_code: string,
			direction: string,
			decimal_separator: string,
			thousands_separator: string,
			date_format: string,
			time_format: string,
			short_time_format: string,
			first_day_of_week: string,
		},
		supported_languages: string[],
		timezone: string,
		theme_mode: 'light' | 'dark',
	},
	system_settings: {
		app_name: string,
	},
};

export type UserContext = {
	id: string,
	avatarUrl: string | null,
	displayName: string,
	email: string,
	entitlements: string[],
	orgs: UserContextOrg[],
	accountSettings: AccountSettings,
	systemSettings: SystemSettings,
};

export type AccountSettings = {
	language: {
		id: string,
		name: string,
		isoCode: string,
		direction: string,
		decimalSeparator: string,
		thousandsSeparator: string,
		dateFormat: string,
		timeFormat: string,
		shortTimeFormat: string,
		firstDayOfWeek: string,
	},
	supportedLanguages: string[],
	timezone: string,
	themeMode: 'light' | 'dark',
};

export type SystemSettings = {
	appName: string,
};

export function toUserContext(response: GetUserContextResponse): UserContext {
	return {
		id: response.id,
		avatarUrl: response.avatar_url,
		displayName: response.display_name,
		email: response.email,
		entitlements: response.entitlements,
		orgs: response.orgs,
		accountSettings: {
			language: {
				id: response.account_settings.language.id,
				name: response.account_settings.language.name,
				isoCode: response.account_settings.language.iso_code,
				direction: response.account_settings.language.direction,
				decimalSeparator: response.account_settings.language.decimal_separator,
				thousandsSeparator: response.account_settings.language.thousands_separator,
				dateFormat: response.account_settings.language.date_format,
				timeFormat: response.account_settings.language.time_format,
				shortTimeFormat: response.account_settings.language.short_time_format,
				firstDayOfWeek: response.account_settings.language.first_day_of_week,
			},
			supportedLanguages: response.account_settings.supported_languages,
			timezone: response.account_settings.timezone,
			themeMode: response.account_settings.theme_mode,
		},
		systemSettings: {
			appName: response.system_settings.app_name,
		},
	};
}

export type UserContextOrg = {
	id: string,
	display_name: string,
	slug: string,
};

export type Language = {
	id: string,
	name: string,
	isoCode: string,
	direction: string,
	decimalSeparator: string,
	thousandsSeparator: string,
	dateFormat: string,
	timeFormat: string,
	shortTimeFormat: string,
	firstDayOfWeek: string,
};

export type LocalSettings = {
	languageCode: string | null,
	themeMode: 'light' | 'dark',
};
