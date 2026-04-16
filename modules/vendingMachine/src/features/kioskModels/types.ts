import { ViewMode } from '@/components';


export type KioskModelViewMode = Extract<ViewMode, 'list' | 'grid'>;

export enum KioskModelStatus {
	ACTIVE = 'active',
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

/** Một dòng trong cấu hình kệ (UI); API dùng `type` trong `shelves_config.config`. */
export interface ShelvesConfigRow {
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
	referenceCode?: string;
	name: string;
	description?: string;
	shelvesNumber?: number;
	isArchived?: boolean;
	goodsCollectorType?: KioskType;
	shelvesConfig?: ShelvesConfigWire | Record<string, unknown>;
	updatedAt?: string;
}
