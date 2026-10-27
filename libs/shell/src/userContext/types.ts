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

/**
 * How tightly controls, rows and fields are packed (backend setting `essential.density`).
 *
 * `compact` is the default, here and in the backend; `spacious` is the look the application had
 * before density existed. Density changes spacing only, through the `--nikki-*` tokens in the Shell's
 * `density.css`; it never changes text size. Not to be confused with the narrow-screen
 * `useIsCompact`.
 */
export type Density = 'spacious' | 'compact';

/** The `<html>` attribute `ApplyStoredDensity` writes and `density.css` reads. */
export const DENSITY_ATTRIBUTE = 'data-nikki-density';

/** The density of a user who never chose one, matching the backend default and `density.css`. */
export const DEFAULT_DENSITY: Density = 'compact';

/** Narrows an unknown value to a `Density`, falling back to {@link DEFAULT_DENSITY}. */
export function toDensity(value: unknown): Density {
	return value === 'spacious' || value === 'compact' ? value : DEFAULT_DENSITY;
}

export type GetUserContextResponse = {
	id: string,
	/** IT Storage file id of the uploaded avatar; resolve with `storageFileUrlOf`. */
	avatar_file_id: string | null,
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
		/** Optional: a backend that predates the setting does not send it. */
		density?: Density,
	},
	system_settings: {
		app_name: string,
	},
};

export type UserContext = {
	id: string,
	avatarFileId: string | null,
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
	density: Density,
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
		avatarFileId: response.avatar_file_id,
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
			density: toDensity(response.account_settings.density),
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
	density: Density,
};

/**
 * What applies before anything is stored. `auto` rather than `light`: it is what the backend
 * defaults to, and it defers to the device instead of overriding a user whose system is set to dark
 * before their stored choice loads.
 */
export const DEFAULT_LOCAL_SETTINGS: LocalSettings = { languageCode: null, themeMode: 'auto', density: DEFAULT_DENSITY };

/**
 * Published after the Shell's mirrored settings are written from outside its React tree -- a
 * settings pane, or a user-context refresh.
 *
 * Must match the name `settingsSaveBar.tsx` publishes; a micro-app cannot import the Shell, so
 * the string is the contract.
 */
export const LOCAL_SETTINGS_CHANGED_EVENT = 'shell:local_settings:changed';

/**
 * Published when something changed which organizations the user belongs to, or how they read: one
 * was created, became ready, was renamed, archived or deleted. The Org Switch refetches its list
 * on it. A micro-app cannot import the Shell, so this string is the contract (see the identity
 * module's `SHELL_USER_ORGS_CHANGED_EVENT`).
 */
export const USER_ORGS_CHANGED_EVENT = 'shell:user_orgs:changed';
