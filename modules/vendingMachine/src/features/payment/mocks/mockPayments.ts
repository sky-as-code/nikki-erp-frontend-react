import momoIcon from '@nikkierp/ui/assets/icons/momo.png';
import mposIcon from '@nikkierp/ui/assets/icons/mpos.png';
import vietqrIcon from '@nikkierp/ui/assets/icons/vietqr.png';
import zalopayIcon from '@nikkierp/ui/assets/icons/zalopay.png';

import { PaymentMethod } from '../types';

import type { RestArchiveResponse } from '@/types';


// Mock data for payment methods (extends DTO with legacy mock fields)
const mockPaymentsData = [
	{
		id: '1',
		method: 'VIETQR',
		name: 'VietQR',
		image: vietqrIcon,
		isArchived: false,
		description: '<p>Thanh toán qua <strong>VietQR</strong></p>',
		minTransactionValue: 0,
		maxTransactionValue: 10000000,
		customFields: [
			{ key: 'merchantId', value: 'VIETQR123456', valueType: 'string' },
			{ key: 'secretKey', value: 'secret123', valueType: 'password' },
			{ key: 'apiUrl', value: 'https://api.vietqr.vn', valueType: 'url' },
		],
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-payment-001',
	},
	{
		id: '2',
		method: 'MPOS',
		name: 'mpos',
		image: mposIcon,
		isArchived: false,
		description: '<p>Thanh toán qua <strong>mpos</strong></p><ul><li>Hỗ trợ thẻ ATM</li><li>Hỗ trợ ví điện tử</li></ul>',
		minTransactionValue: 10000,
		maxTransactionValue: 50000000,
		customFields: [
			{ key: 'merchantId', value: 'MPOS123456', valueType: 'string' },
			{ key: 'secretKey', value: 'secret123', valueType: 'password' },
			{ key: 'apiUrl', value: 'https://api.mpos.vn', valueType: 'url' },
		],
		createdAt: '2024-01-10T09:30:00Z',
		etag: 'etag-payment-002',
	},
	{
		id: '3',
		method: 'MOMO',
		name: 'MoMo',
		image: momoIcon,
		isArchived: false,
		description: '<p>Thanh toán qua <strong>Ví MoMo</strong></p>',
		minTransactionValue: 10000,
		maxTransactionValue: 20000000,
		customFields: [
			{ key: 'partnerCode', value: 'MOMO001', valueType: 'string' },
			{ key: 'accessKey', value: 'access123', valueType: 'password' },
			{ key: 'secretKey', value: 'secret456', valueType: 'password' },
		],
		createdAt: '2024-01-20T10:15:00Z',
		etag: 'etag-payment-003',
	},
	{
		id: '4',
		method: 'ZALOPAY',
		name: 'ZaloPay',
		image: zalopayIcon,
		isArchived: false,
		description: '<p>Thanh toán qua <strong>ZaloPay</strong></p>',
		minTransactionValue: 10000,
		maxTransactionValue: 30000000,
		customFields: [
			{ key: 'appId', value: 'ZALO001', valueType: 'string' },
			{ key: 'key1', value: 'key1value', valueType: 'password' },
			{ key: 'key2', value: 'key2value', valueType: 'password' },
		],
		createdAt: '2024-02-01T14:20:00Z',
		etag: 'etag-payment-004',
	},
	{
		id: '5',
		method: 'BANK_TRANSFER',
		name: 'Chuyển khoản ngân hàng',
		image: '',
		isArchived: true,
		description: '<p>Thanh toán qua <strong>chuyển khoản ngân hàng</strong></p>',
		minTransactionValue: 50000,
		maxTransactionValue: 100000000,
		customFields: [
			{ key: 'bankAccount', value: '1234567890', valueType: 'string' },
			{ key: 'bankName', value: 'Vietcombank', valueType: 'string' },
		],
		createdAt: '2024-02-10T11:45:00Z',
		etag: 'etag-payment-005',
	},
] as any[];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockPayments = {
	async listPayments(): Promise<PaymentMethod[]> {
		await delay(500);
		return [...mockPaymentsData];
	},

	async getPayment(id: string): Promise<PaymentMethod | undefined> {
		await delay(300);
		return mockPaymentsData.find((p) => p.id === id);
	},

	async createPayment(payment: Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>): Promise<PaymentMethod> {
		await delay(500);
		const newPayment: PaymentMethod = {
			...payment,
			id: String(mockPaymentsData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-payment-${Date.now()}`,
		};
		mockPaymentsData.push(newPayment);
		return newPayment;
	},

	async updatePayment(
		id: string,
		etag: string,
		updates: Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'etag'>>,
	): Promise<PaymentMethod> {
		await delay(500);
		const index = mockPaymentsData.findIndex((p) => p.id === id);
		if (index === -1) {
			throw new Error('Payment method not found');
		}
		const updatedPayment: PaymentMethod = {
			...mockPaymentsData[index],
			...updates,
			etag: `etag-payment-${Date.now()}`,
		};
		mockPaymentsData[index] = updatedPayment;
		return updatedPayment;
	},

	async deletePayment(id: string): Promise<void> {
		await delay(500);
		const index = mockPaymentsData.findIndex((p) => p.id === id);
		if (index === -1) {
			throw new Error('Payment method not found');
		}
		mockPaymentsData.splice(index, 1);
	},

	async setArchivedPayment(
		id: string,
		body: { etag: string; isArchived: boolean },
	): Promise<RestArchiveResponse> {
		await delay(400);
		const index = mockPaymentsData.findIndex((p) => p.id === id);
		if (index === -1) {
			throw new Error('Payment method not found');
		}
		const nextEtag = `etag-payment-${Date.now()}`;
		mockPaymentsData[index] = {
			...mockPaymentsData[index],
			isArchived: body.isArchived,
			etag: nextEtag,
		};
		return {
			affectedCount: 1,
			affectedAt: new Date().toISOString(),
			etag: nextEtag,
		};
	},
};
