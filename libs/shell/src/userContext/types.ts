import type * as dyn from '@nikkierp/common/dynamicModel';


export const SLICE_NAME = 'shell.userContext';
export const LOCAL_SETTINGS_STORAGE_KEY = `shell:userContext:settings`;
export const ACTIVE_ORG_STORAGE_KEY = `shell:userContext:activeOrgId`;

/**
 * How the interface is coloured.
 *
 * `auto` follows the device's own light/dark setting and is what the backend defaults to
 * (`iam/transport/restful/v1/user_rest.go`, `ThemeModeAuto`). It is also a value the settings API
 * accepts, so a type of `'light' | 'dark'` could not hold what the server actually sends. These
 * are the three values Mantine's `setColorScheme` takes, deliberately.
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

export type GetUserContextResponse = {
	id: string,
	avatar_url: string | null,
	display_name: string,
	email: string,
	entitlements: string[],
	/**
	 * The caller's own evaluation context, needed to mirror the backend guard. Entitlements alone
	 * are not enough: a bare `org` grant answers only for an org the caller belongs to.
	 */
	is_owner: boolean,
	user_org_ids: string[],
	org_unit_id: string | null,
	org_unit_org_id: string | null,
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
		/**
		 * The organization's `default_currency`, resolved against the currency catalogue. Absent
		 * when the organization has not set one: there is no safe default, so the backend omits
		 * the key rather than guessing.
		 */
		currency?: {
			code: string,
			symbol: string,
			decimal_places: number,
		},
		supported_languages: string[],
		timezone: string,
		theme_mode: ThemeMode,
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
	isOwner: boolean,
	userOrgIds: string[],
	orgUnitId: string | null,
	orgUnitOrgId: string | null,
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
	currency?: Currency,
	supportedLanguages: string[],
	timezone: string,
	themeMode: ThemeMode,
};

/**
 * What it takes to render an amount.
 *
 * `symbol` is routinely empty — the currency catalogue seeds no symbols, on the grounds that a
 * wrong symbol on money is worse than none — so a renderer falls back to `code`.
 */
export type Currency = {
	code: string,
	symbol: string,
	decimalPlaces: number,
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
		isOwner: response.is_owner,
		userOrgIds: response.user_org_ids ?? [],
		orgUnitId: response.org_unit_id,
		orgUnitOrgId: response.org_unit_org_id,
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
			currency: toCurrency(response.account_settings.currency),
			supportedLanguages: response.account_settings.supported_languages,
			timezone: response.account_settings.timezone,
			themeMode: response.account_settings.theme_mode,
		},
		systemSettings: {
			appName: response.system_settings.app_name,
		},
	};
}

function toCurrency(src: GetUserContextResponse['account_settings']['currency']): Currency | undefined {
	return src && {
		code: src.code,
		symbol: src.symbol,
		decimalPlaces: src.decimal_places,
	};
}

export type UserContextOrg = {
	id: string,
	/** LangJson: the backend stores one document per organization, keyed by language. */
	display_name: dyn.ModelSchemaLangJson,
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
	themeMode: ThemeMode,
};
