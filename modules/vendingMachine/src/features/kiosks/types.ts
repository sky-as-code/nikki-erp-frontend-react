import { Slideshow } from '../slideshow/types';

import type { Game } from '../games/types';
import type { Theme } from '../themes/types';


export type UIMode = 'normal' | 'focus';

/** API: KioskStatus (openapi / domain) */
export enum KioskStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	DELETED = 'deleted',
}

/** API: KioskMode */
export enum KioskMode {
	PENDING = 'pending',
	SELLING = 'selling',
	SLIDESHOW_ONLY = 'slideshow-only',
}

/** API: KioskInterfaceMode */
export enum KioskInterfaceMode {
	NORMAL = 'normal',
	FOCUS = 'focus',
}

export enum ConnectionStatus {
	FAST = 'fast',
	SLOW = 'slow',
	DISCONNECTED = 'disconnected',
}

export enum MachineType {
	DROP_PRODUCT = 'dropProduct',
	ELEVATOR = 'elevator',
}

export enum ErrorType {
	DISCONNECTED = 'disconnected',
	DEVICE_ERROR = 'deviceError',
	TEMPERATURE = 'temperature',
	HUMIDITY = 'humidity',
	POWER_CONSUMPTION = 'powerConsumption',
	POWER_CAPACITY = 'powerCapacity',
	SALES_APP_ERROR = 'salesAppError',
	REFUND_ERROR = 'refundError',
	WARNING = 'warning',
}

export enum ErrorStatus {
	PENDING = 'pending',
	RESOLVED = 'resolved',
	IN_PROGRESS = 'inProgress',
}

export interface ConnectionHistory {
	connection: ConnectionStatus;
	createdAt: string;
}

export interface KioskError {
	id: string;
	kioskId: string;
	kioskCode: string;
	kioskName: string;
	type: ErrorType;
	status: ErrorStatus;
	description: string;
	reportedAt: string;
	resolvedAt?: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface LowStockAlert {
	id: string;
	kioskId: string;
	kioskCode: string;
	kioskName: string;
	stockRatio: number;
	requestedAt: string;
	restockedAt?: string;
	items: Array<{
		productId: string;
		productName: string;
		currentStock: number;
		maxStock: number;
	}>;
}

export interface CustomerUsage {
	kioskId: string;
	kioskCode: string;
	kioskName: string;
	date: string;
	usageCount: number;
}

export interface OperationParameter {
	kioskId: string;
	timestamp: string;
	temperature: number;
	humidity: number;
	powerConsumption: number;
	cpu?: number;
	redis?: number;
	memory?: number;
}

export interface SupportRequest {
	id: string;
	kioskId: string;
	kioskCode: string;
	kioskName: string;
	customerName: string;
	customerPhone: string;
	description: string;
	status: 'pending' | 'in_progress' | 'resolved';
	createdAt: string;
	resolvedAt?: string;
}

export interface KioskWarning {
	id: string;
	type: string;
	message: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	createdAt: string;
}

/**
 * Kiosk entity (KioskDto + optional UI-only fields from mocks / desktop telemetry).
 */
export interface Kiosk {
	id: string;
	createdAt: string;
	etag: string;
	code: string;
	name: string;
	modelRef?: string | null;
	settingRef?: string | null;
	status?: KioskStatus | null;
	mode?: KioskMode | null;
	locationAddress?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	interfaceMode?: KioskInterfaceMode | null;
	shoppingScreenPlaylistRef?: string | null;
	waitingScreenPlaylistRef?: string | null;
	themeRef?: string | null;
	gameRef?: string | null;
	updatedAt?: string | null;
	connection?: Record<string, unknown> | null;

	/** Optional: resolved relations when using graph/columns */
	theme?: Theme;
	game?: Game;
	waitingPlaylist?: Slideshow;
	shoppingPlaylist?: Slideshow;

	/** UI / telemetry (not on KioskDto) */
	warnings?: KioskWarning[];
	temperature?: number;
	humidity?: number;
	powerConsumption?: number;
	cpu?: number;
	redis?: number;
	memory?: number;
	machineType?: MachineType;
}

export type CreateKioskBody = {
	code: string;
	name: string;
	modelRef: string;
	settingRef?: string | null;
	status?: KioskStatus;
	mode?: KioskMode;
	locationAddress?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	interfaceMode?: KioskInterfaceMode;
	shoppingScreenPlaylistRef?: string | null;
	waitingScreenPlaylistRef?: string | null;
	themeRef?: string | null;
	gameRef?: string | null;
};

export type UpdateKioskBody = {
	id: string;
	etag: string;
	code?: string | null;
	name?: string | null;
	modelRef?: string | null;
	settingRef?: string | null;
	status?: KioskStatus;
	mode?: KioskMode;
	locationAddress?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	interfaceMode?: KioskInterfaceMode;
	shoppingScreenPlaylistRef?: string | null;
	waitingScreenPlaylistRef?: string | null;
	themeRef?: string | null;
	gameRef?: string | null;
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

export enum KioskActivityLogType {
	WARNING = 'warning',
	STATUS_DETAIL = 'statusDetail',
	ERROR = 'error',
	INFO = 'info',
}

export interface KioskActivityLog {
	id: string;
	timestamp: string;
	type: 'warning' | 'statusDetail' | 'error' | 'info';
	content: string;
}
