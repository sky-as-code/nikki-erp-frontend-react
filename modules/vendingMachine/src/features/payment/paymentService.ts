import * as request from '@nikkierp/common/request';
import { buildColumnsQuery, snakeToCamelObject } from '@nikkierp/common/utils';

import { mockPayments } from './mockPayments';
import { PaymentMethod } from './types';
import { PagedSearchResponse } from '../kiosks/types';


function configFields(dto: PaymentMethod): PaymentMethod {
	return {
		...dto,
	};
}

const BASE_PATH = 'vending-machine/payments';

export const paymentService = {
	async listPayments(params?: {
		page?: number;
		size?: number;
		graph?: string;
		columns?: Array<keyof PaymentMethod>;
	}): Promise<PagedSearchResponse<PaymentMethod>> {
		const { columns, ...restParams } = params || {};
		const result = await request.get<any>(BASE_PATH, {
			searchParams: [
				...Object.entries(restParams),
				...buildColumnsQuery<PaymentMethod>(columns || []),
			],
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
};
