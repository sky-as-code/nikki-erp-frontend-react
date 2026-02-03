export type PaymentMethodStatus = 'active' | 'inactive';

export type CustomFieldValueType = 'string' | 'number' | 'password' | 'email' | 'url' | 'date';

export interface PaymentMethodCustomField {
	key: string;
	value: string;
	valueType: CustomFieldValueType;
}

export interface PaymentMethod {
	id: string;
	code: string;
	name: string;
	image?: string;
	status: PaymentMethodStatus;
	description?: string; // HTML string
	minTransactionValue?: number;
	maxTransactionValue?: number;
	customFields: PaymentMethodCustomField[];
	createdAt: string;
	etag: string;
}
