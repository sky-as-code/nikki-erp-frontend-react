import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, snakeToCamelObject } from '@nikkierp/common/utils';

import { buildSearchParams } from '@/helpers';
import { PagedSearchResponse, RestArchiveResponse, SearchParams } from '@/types';

import { mockPayments } from './mocks';
import { PaymentMethod } from './types';



function configFields(dto: PaymentMethod): PaymentMethod {
	return {
		...dto,
	};
}

const BASE_PATH = 'vending-machine/payments';

export const paymentService = {
	async listPayments(params?: SearchParams<PaymentMethod>): Promise<PagedSearchResponse<PaymentMethod>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<PaymentMethod>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<PaymentMethod>;
	},

	async getPayment(id: string): Promise<PaymentMethod | undefined> {
		const result = await mockPayments.getPayment(id);
		return result ? configFields(result) : undefined;
	},

	async createPayment(payment: Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>): Promise<PaymentMethod> {
		const result = await mockPayments.createPayment(payment);
		return configFields(result);
	},

	async updatePayment(
		id: string,
		etag: string,
		updates: Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>>,
	): Promise<PaymentMethod> {
		const result = await mockPayments.updatePayment(id, etag, updates);
		return configFields(result);
	},

	async deletePayment(id: string): Promise<void> {
		await mockPayments.deletePayment(id);
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
