import * as request from '@nikkierp/common/request';
import { snakeToCamelObject, camelToSnakeObject, buildColumnsQuery, cleanEmptyString } from '@nikkierp/common/utils';

import { KioskModelCreatePayload } from './hooks/useKioskModelCreate';
import { KioskModelUpdatePayload } from './hooks/useKioskModelEdit';

import type {
	KioskModel,
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	PagedSearchResponse,
} from './types';


const BASE_PATH = 'vending-machine/kiosk-models';


export const kioskModelService = {
	async searchKioskModels(
		params?: { page?: number; size?: number; graph?: string; columns?: Array<keyof KioskModel> },
	): Promise<PagedSearchResponse<KioskModel>> {
		const {columns, ...restParams} = params || {};
		const result = await request.get<any>(BASE_PATH, {
			searchParams: [
				...Object.entries(restParams || []),
				...buildColumnsQuery<KioskModel>(columns || []),
			],
		});
		const converted = snakeToCamelObject(result) as PagedSearchResponse<KioskModel>;
		return converted;
	},

	async getKioskModel(id: string, columns?: Array<keyof KioskModel>): Promise<KioskModel> {
		const columnsQuery = buildColumnsQuery<KioskModel>(columns || []);
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: [
				...columnsQuery,
			],
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

	async deleteKioskModel(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},
};
