import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, cleanEmptyString, snakeToCamelObject } from '@nikkierp/common/utils';

import { buildSearchParams } from '@/helpers';
import { PagedSearchResponse, RestArchiveResponse, RestCreateResponse, SearchParams } from '@/types';

import { PaymentMethod } from './types';



function configFields(dto: PaymentMethod): PaymentMethod {
	return {
		...dto,
	};
}

const BASE_PATH = 'vending-machine/payments';

async function fetchPaymentById(id: string): Promise<PaymentMethod> {
	const result = await request.get<any>(`${BASE_PATH}/${id}`);
	return configFields(snakeToCamelObject(result) as PaymentMethod);
}

export const paymentService = {
	async listPayments(params?: SearchParams<PaymentMethod>): Promise<PagedSearchResponse<PaymentMethod>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<PaymentMethod>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<PaymentMethod>;
	},

	async getPayment(id: string): Promise<PaymentMethod> {
		return fetchPaymentById(id);
	},

	async createPayment(payment: Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>): Promise<PaymentMethod> {
		const cleanedBody = cleanEmptyString(payment as object);
		const snakeBody = camelToSnakeObject(cleanedBody);
		const result = await request.post<any>(BASE_PATH, { json: snakeBody });
		const created = snakeToCamelObject(result) as RestCreateResponse;
		return fetchPaymentById(created.id);
	},

	async updatePayment(
		id: string,
		etag: string,
		updates: Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>>,
	): Promise<PaymentMethod> {
		const cleanedBody = cleanEmptyString({ etag, ...updates } as object);
		const snakeBody = camelToSnakeObject(cleanedBody);
		await request.put<any>(`${BASE_PATH}/${id}`, { json: snakeBody });
		return fetchPaymentById(id);
	},

	async deletePayment(id: string): Promise<void> {
		await request.del<any>(`${BASE_PATH}/${id}`);
	},

	async setArchivedPayment(
		id: string,
		body: { etag: string; isArchived: boolean },
	): Promise<RestArchiveResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<any>(`${BASE_PATH}/${id}/archived`, { json: snakeBody });
		return snakeToCamelObject(result) as RestArchiveResponse;
	},
};
