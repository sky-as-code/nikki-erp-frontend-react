import { ViewMode } from '@/components';


export type KioskModelViewMode = Extract<ViewMode, 'list' | 'grid'>;

export type KioskType = 'elevator' | 'nonElevator';

export const KIOSK_SHELF_TYPES = {
	spring: 'spring',
	conveyor: 'conveyor',
	hangingConveyor: 'hangingConveyor',
	pushTape: 'pushTape',
} as const;
export type KioskShelfType = (typeof KIOSK_SHELF_TYPES)[keyof typeof KIOSK_SHELF_TYPES];

export interface TrayConfiguration {
	row: string; // A, B, C, D, etc.
	shelfType?: KioskShelfType;
}

export interface KioskModel {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive';
	kioskType?: KioskType;
	numberOfTrays?: number;
	trayConfigurations?: TrayConfiguration[];
	createdAt: string;
	etag: string;
}

