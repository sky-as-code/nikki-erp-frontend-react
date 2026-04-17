import { getRequestBaseUrl } from '@nikkierp/common/request';
import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, cleanEmptyString, snakeToCamelObject } from '@nikkierp/common/utils';

import type { KioskMedia } from './types';
import type {
	PagedSearchResponse,
	RestArchiveResponse,
	RestCreateResponse,
	RestDeleteResponse,
	SearchParams,
	RestUpdateResponse,
} from '@/types';

import { buildSearchParams } from '@/helpers';


const BASE_PATH = 'vending-machine/kiosk-media';

/** Relative path for GET stream (append to API base URL). */
export function kioskMediaStreamPath(kioskMediaId: string): string {
	return `${BASE_PATH}/${kioskMediaId}/stream`;
}

/** Full URL for `<img>` / `<video>` preview (same origin as `BASE_API_URL`, e.g. `…/v1`). */
export function buildKioskMediaStreamAbsoluteUrl(baseApiUrl: string, kioskMediaId: string): string {
	const base = baseApiUrl.replace(/\/$/, '');
	return `${base}/${BASE_PATH}/${kioskMediaId}/stream`;
}

/** Stream URL from current `initRequestMaker` base URL (falls back to relative path if not inited). */
export function getKioskMediaStreamUrl(kioskMediaId: string): string {
	const base = getRequestBaseUrl();
	if (!base) {
		return kioskMediaStreamPath(kioskMediaId);
	}
	return buildKioskMediaStreamAbsoluteUrl(base, kioskMediaId);
}

export const kioskMediaService = {
	async searchKioskMedias(params?: SearchParams<KioskMedia>): Promise<PagedSearchResponse<KioskMedia>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<KioskMedia>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<KioskMedia>;
	},

	async getKioskMediaById(id: string, columns?: Array<keyof KioskMedia>): Promise<KioskMedia> {
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: buildSearchParams<KioskMedia>(columns ? { columns } : undefined),
		});
		return snakeToCamelObject(result) as KioskMedia;
	},

	async createKioskMedia(form: FormData): Promise<RestCreateResponse> {
		const result = await request.post<any>(BASE_PATH, { body: form });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updateKioskMediaName(id: string, body: { etag: string; name: string }): Promise<RestUpdateResponse> {
		const cleaned = cleanEmptyString(body as object);
		const result = await request.put<any>(`${BASE_PATH}/${id}/name`, { json: camelToSnakeObject(cleaned) });
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deleteKioskMedia(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	async setKioskMediaArchived(id: string, body: { etag: string; isArchived: boolean }): Promise<RestArchiveResponse> {
		const result = await request.post<any>(`${BASE_PATH}/${id}/archived`, {
			json: camelToSnakeObject(body),
		});
		return snakeToCamelObject(result) as RestArchiveResponse;
	},
};
