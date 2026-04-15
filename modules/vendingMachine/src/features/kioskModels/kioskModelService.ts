import * as request from '@nikkierp/common/request';
import { snakeToCamelObject, camelToSnakeObject, buildColumnsQuery, cleanEmptyString } from '@nikkierp/common/utils';

import { KioskModel } from '@/features/kioskModels/types';
import { buildSearchParams } from '@/helpers';

import { KioskModelCreatePayload } from './hooks/useKioskModelCreate';
import { KioskModelUpdatePayload } from './hooks/useKioskModelEdit';

import type {
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	PagedSearchResponse,
	SearchParams,
	RestArchiveResponse,
} from '@/types';


const BASE_PATH = 'vending-machine/kiosk-models';


export const kioskModelService = {
	async searchKioskModels(params?: SearchParams<KioskModel>): Promise<PagedSearchResponse<KioskModel>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<KioskModel>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<KioskModel>;
	},

	async getKioskModel(id: string, columns?: Array<keyof KioskModel>): Promise<KioskModel> {
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: buildColumnsQuery<KioskModel>(columns || []),
		});
		return snakeToCamelObject(result) as KioskModel;
	},

	async createKioskModel(body: KioskModelCreatePayload): Promise<RestCreateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);

		const result = await request.post<any>(BASE_PATH, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updateKioskModel({ id, body }: KioskModelUpdatePayload): Promise<RestUpdateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);

		const result = await request.put<any>(`${BASE_PATH}/${id}`, { json: snakeBody });
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async setArchivedKioskModel(id: string, body: { etag: string, isArchived: boolean }): Promise<RestArchiveResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<any>(`${BASE_PATH}/${id}/archived`, { json: snakeBody });
		return snakeToCamelObject(result) as RestArchiveResponse;
	},

	async deleteKioskModel(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},
};
