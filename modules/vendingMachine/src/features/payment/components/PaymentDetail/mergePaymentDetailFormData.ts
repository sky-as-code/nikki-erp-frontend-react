import {
	paymentRowsToConfig,
	type PaymentConfigRow,
} from '@/features/payment/utils/paymentConfigRows';

import type { PaymentUpdateFormData } from '@/features/payment/hooks/usePaymentEdit';
import type { PaymentMethod } from '@/features/payment/types';



export function mergePaymentDetailFormData(
	payment: PaymentMethod,
	data: Record<string, unknown>,
	configRows: PaymentConfigRow[],
): PaymentUpdateFormData {
	return {
		id: payment.id,
		etag: payment.etag,
		name: data.name !== undefined && data.name !== null ? String(data.name) : payment.name,
		method: data.method !== undefined && data.method !== null ? String(data.method) : payment.method,
		image: data.image !== undefined && data.image !== '' ? String(data.image) : payment.image,
		config: paymentRowsToConfig(configRows),
	};
}
