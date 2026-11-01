import { RequestMaker } from '@nikkierp/common/request';

import { TIMEZONES_PATH } from '../../constants';

import type { SettingOption } from '@nikkierp/viewkit-mantine';


/** Enough for a typed keyword to land on its zone; the catalogue holds about 420. */
const PAGE_SIZE = 50;

type SearchTimezonesResponse = {
	items: { code: string, label: string }[],
	total: number,
};

/**
 * Searches the backend's hardcoded IANA catalogue by "contains" on the zone id and on its label in
 * `languageCode`, which the server takes from the `timezone` translation namespace. The stored value
 * is the id.
 */
export async function searchTimezones(keyword: string, languageCode: string): Promise<SettingOption[]> {
	const searchParams = new URLSearchParams({ keyword, language_code: languageCode, size: String(PAGE_SIZE) });
	const result = await RequestMaker.default().get<SearchTimezonesResponse>(TIMEZONES_PATH, {
		searchParams,
		dedupKey: `GET/${TIMEZONES_PATH}?${searchParams.toString()}`,
	});
	return (result.data?.items ?? []).map(item => ({ value: item.code, label: item.label }));
}
