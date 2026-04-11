import { KioskModel } from '../kioskModels/types';
import { KioskSetting } from '../kioskSettings';
import { Slideshow } from '../slideshow/types';

import type { Game } from '../games/types';
import type { Theme } from '../themes/types';


export enum UIMode {
	NORMAL = 'normal',
	FOCUS = 'focus',
}

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

/** API: KioskInterfaceMode (deprecated) */
/** @deprecated use UIMode instead */
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
	status: ConnectionStatus;
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
	etag: string;
	code: string;
	name: string;
	isArchived?: boolean | null;
	status?: KioskStatus | null;
	mode?: KioskMode | null;
	uiMode?: UIMode | null;
	locationAddress?: string | null;
	latitude?: string | null;
	longitude?: string | null;
	lastPing?: string | null;
	connections?: ConnectionHistory[] | null;

	// ref
	modelRef?: string | null;
	model?: KioskModel | null;

	settingRef?: string | null;
	setting?: KioskSetting;

	paymentRefs?: string[] | null;
	payments?: any[];

	eventRefs?: string[] | null;
	events?: any[];

	themeRef?: string | null;
	theme?: Theme;

	gameRef?: string | null;
	game?: Game;

	shoppingScreenPlaylistRef?: string | null;
	shoppingScreenPlaylist?: Slideshow | null;
	waitingScreenPlaylistRef?: string | null;
	waitingScreenPlaylist?: Slideshow | null;

	// base fields
	scopeType?: string | null;
	createdAt: string;
	updatedAt?: string | null;

	/** UI / telemetry (not on KioskDto) */
	warnings?: KioskWarning[];
	temperature?: number;
	humidity?: number;
	powerConsumption?: number;
	cpu?: number;
	redis?: number;
	memory?: number;
}

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
