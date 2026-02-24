import { mockPayments } from './mockPayments';
import { PaymentMethod } from './types';


function configFields(dto: PaymentMethod): PaymentMethod {
	return {
		...dto,
	};
}

export const paymentService = {
	async listPayments(): Promise<PaymentMethod[]> {
		const result = await mockPayments.listPayments();
		return result.map(configFields);
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
