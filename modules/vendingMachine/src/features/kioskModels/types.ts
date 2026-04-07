import { ViewMode } from '@/components';


export type KioskModelViewMode = Extract<ViewMode, 'list' | 'grid'>;

export enum KioskModelStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	DELETED = 'deleted',
}

export type KioskType = 'elevator' | 'non-elevator';

export const KIOSK_SHELF_TYPES = {
	spring: 'spring',
	conveyor: 'conveyor',
	hangingConveyor: 'hangingConveyor',
	pushTape: 'pushTape',
} as const;
export type KioskShelfType = (typeof KIOSK_SHELF_TYPES)[keyof typeof KIOSK_SHELF_TYPES];

export interface TrayConfiguration {
	row: string;
	shelfType?: KioskShelfType;
}

export interface KioskModel {
	id: string;
	createdAt: string;
	etag: string;
	modelId?: string;
	referenceCode?: string;
	name: string;
	description?: string;
	shelvesNumber?: number;
	status: KioskModelStatus;
	kioskType?: KioskType;
	shelvesConfig?: Record<string, any>;
	updatedAt?: string;
}

export type CreateKioskModelBody = {
	modelId?: string;
	referenceCode?: string;
	name: string;
	description?: string;
	shelvesNumber?: number;
	status?: KioskModelStatus;
	kioskType?: KioskType;
	shelvesConfig?: Record<string, any>;
};

export type UpdateKioskModelBody = {
	id: string;
	etag: string;
	modelId?: string;
	referenceCode?: string;
	name?: string;
	description?: string;
	shelvesNumber?: number;
	status?: KioskModelStatus;
	kioskType?: KioskType;
	shelvesConfig?: Record<string, any>;
};

export type RestCreateResponse = {
	id: string;
	createdAt: number;
	etag: string;
};

export type RestUpdateResponse = {
	id: string;
	updatedAt: number;
	etag: string;
};

export type RestDeleteResponse = {
	id: string;
	deletedAt: number;
};

export type PagedSearchResponse<T> = {
	items: T[];
	total: number;
	page: number;
	size: number;
};
