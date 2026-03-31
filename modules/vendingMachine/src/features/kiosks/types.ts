import { Slideshow } from '../slideshow/types';

import type { Game } from '../games/types';
import type { Theme } from '../themes/types';


export type UIMode = 'normal' | 'focus';

export enum KioskStatus {
	DISABLED = 'disabled',
	ACTIVATED = 'activated',
	DELETED = 'deleted',
}

export enum KioskMode {
	PENDING = 'pending', //* screen locked in maintenance page
	SELLING = 'selling', //* selling mode
	SLIDESHOW_ONLY = 'slideshowOnly', //* slideshow only mode
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
	reportedAt: string;
}

export interface KioskCoordinates {
	latitude: number;
	longitude: number;
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
	stockRatio: number; // 0-1, percentage of stock remaining
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

export interface Kiosk {
	id: string;
	code: string;
	name: string;
	address: string;
	coordinates: KioskCoordinates;
	isActive: boolean;
	status: KioskStatus;
	mode: KioskMode;
	connectionStatus: ConnectionStatus;
	machineType?: MachineType;
	connectionHistory?: ConnectionHistory[];
	warnings?: KioskWarning[];
	temperature?: number;
	humidity?: number;
	powerConsumption?: number;
	cpu?: number;
	redis?: number;
	memory?: number;
	createdAt: string;
	deletedAt?: string;
	etag: string;
	/** Optional: kiosk model assignment (create/update payloads) */
	modelId?: string;
	/** Optional: enabled payment methods */
	paymentMethodIds?: string[];

	uiMode?: UIMode;
	waitingPlaylist?: Slideshow;
	shoppingPlaylist?: Slideshow;
	theme?: Theme;
	game?: Game;
}


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