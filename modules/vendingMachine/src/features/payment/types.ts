export type CustomFieldValueType = 'string' | 'number' | 'password' | 'email' | 'url' | 'date';

export interface PaymentMethodConfig {
	[key: string]: string | number | boolean | null | undefined;
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