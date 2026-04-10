import { ViewMode } from '@/components';


export type KioskModelViewMode = Extract<ViewMode, 'list' | 'grid'>;

export enum KioskModelStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	DELETED = 'deleted',
}

export const KIOSK_TYPES = {
	ELEVATOR: 'elevator',
	NON_ELEVATOR: 'non-elevator',
} as const;
export type KioskType = (typeof KIOSK_TYPES)[keyof typeof KIOSK_TYPES];

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

/** API JSON: shelves_config.config[] uses `type` (not shelf_type). */
export interface ShelvesConfigWire {
	config: Array<{ row: string; type: string }>;
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
	shelvesConfig?: ShelvesConfigWire | Record<string, unknown>;
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
	shelvesConfig?: ShelvesConfigWire | Record<string, unknown>;
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
	shelvesConfig?: ShelvesConfigWire | Record<string, unknown>;
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
