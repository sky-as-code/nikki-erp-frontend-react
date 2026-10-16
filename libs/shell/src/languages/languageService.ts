import * as request from '@nikkierp/common/request';

import type { RequestResult } from '@nikkierp/common/request';


/** One language a user may pick: the `essential_languages` rows marked `is_enabled`. */
export type EnabledLanguage = {
	isoCode: string,
	name: string,
};

type LanguageRow = {
	iso_code: string,
	name: string,
};

type ListEnabledLanguagesResponse = {
	items: LanguageRow[],
	/** What a user reads when neither they nor their organization chose a language. */
	default_iso_code: string,
};

export type EnabledLanguages = {
	languages: EnabledLanguage[],
	defaultIsoCode: string | null,
};

/**
 * Reads the enabled languages from Essential's public list.
 *
 * Public because the sign-in page offers a language switch before anyone has a session. Not a
 * store service: the list is reference data read once per session and shared by every picker,
 * which a module-level promise covers without a slice.
 */
export function fetchEnabledLanguages(): Promise<RequestResult<ListEnabledLanguagesResponse>> {
	return request.get<ListEnabledLanguagesResponse>('v1/essential/languages/enabled');
}

export function toEnabledLanguages(response: ListEnabledLanguagesResponse | null): EnabledLanguages {
	return {
		languages: (response?.items ?? []).map(row => ({ isoCode: row.iso_code, name: row.name })),
		defaultIsoCode: response?.default_iso_code || null,
	};
}
