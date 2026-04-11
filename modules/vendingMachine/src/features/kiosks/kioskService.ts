import * as request from '@nikkierp/common/request';
import { snakeToCamelObject, camelToSnakeObject, buildColumnsQuery, cleanEmptyString } from '@nikkierp/common/utils';

import { KioskCreatePayload, KioskUpdatePayload } from './hooks';

import type {
	Kiosk,
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	PagedSearchResponse,
} from './types';


const BASE_PATH = 'vending-machine/kiosks';

export const kioskService = {
	async searchKiosks(
		params?: { page?: number; size?: number; graph?: string; columns?: Array<keyof Kiosk> },
	): Promise<PagedSearchResponse<Kiosk>> {
		const { columns, ...restParams } = params || {};
		const result = await request.get<any>(BASE_PATH, {
			searchParams: [
				...Object.entries(restParams),
				...buildColumnsQuery<Kiosk>(columns || []),
			],
		});
		return snakeToCamelObject(result) as PagedSearchResponse<Kiosk>;
	},

	async getKiosk(id: string, columns?: Array<keyof Kiosk>): Promise<Kiosk> {
		const columnsQuery = buildColumnsQuery<Kiosk>(columns || []);
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: [...columnsQuery],
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
};
