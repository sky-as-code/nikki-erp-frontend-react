import * as request from '@nikkierp/common/request';
import { snakeToCamelObject, camelToSnakeObject, buildColumnsQuery, cleanEmptyString } from '@nikkierp/common/utils';

import { buildSearchParams } from '@/helpers';

import { KioskCreatePayload, KioskUpdatePayload } from './hooks';
import { Kiosk, KioskLog } from './types';

import type {
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	RestArchiveResponse,
	PagedSearchResponse,
	SearchParams,
} from '@/types';


const BASE_PATH = 'vending-machine/kiosks';

export const kioskService = {
	async searchKiosks(params?: SearchParams<Kiosk>): Promise<PagedSearchResponse<Kiosk>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<Kiosk>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<Kiosk>;
	},

	async getKiosk(id: string, columns?: Array<keyof Kiosk>): Promise<Kiosk> {
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: buildColumnsQuery<Kiosk>(columns || []),
		});
		return snakeToCamelObject(result) as Kiosk;
	},

	async createKiosk(body: KioskCreatePayload): Promise<RestCreateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);

		const result = await request.post<any>(BASE_PATH, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updateKiosk({ id, body }: KioskUpdatePayload): Promise<RestUpdateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);

		const result = await request.put<any>(`${BASE_PATH}/${id}`, { json: snakeBody });
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deleteKiosk(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	async setArchivedKiosk(id: string, body: { etag: string; isArchived: boolean }): Promise<RestArchiveResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<any>(`${BASE_PATH}/${id}/archived`, { json: snakeBody });
		return snakeToCamelObject(result) as RestArchiveResponse;
	},

	async searchKioskLogs(params?: SearchParams<KioskLog>): Promise<PagedSearchResponse<KioskLog>> {
		const result = await request.get<any>('vending-machine/kiosk-logs', {
			searchParams: buildSearchParams<KioskLog>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<KioskLog>;
	},
};
