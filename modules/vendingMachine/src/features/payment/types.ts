export type CustomFieldValueType = 'string' | 'number' | 'password' | 'email' | 'url' | 'date';

export type PaymentMethodConfigValue = {
	key: string;
	value: string;
	valueType: CustomFieldValueType;
};

export interface PaymentMethodConfig {
	[key: string]: PaymentMethodConfigValue;
}

export interface PaymentMethod {
	id: string;
	name: string;
	method: string;
	image?: string;
	isArchived: boolean;
	config?: PaymentMethodConfig;
	createdAt: string;
	updatedAt: string;
	etag: string;
}