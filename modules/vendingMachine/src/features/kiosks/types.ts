export enum KioskStatus {
	DISABLED = 'disabled',
	ACTIVATED = 'activated',
	DELETED = 'deleted',
}

export enum KioskMode {
	PENDING = 'pending',
	SELLING = 'selling',
	ADSONLY = 'adsOnly',
}

export enum ConnectionStatus {
	FAST = 'fast',
	SLOW = 'slow',
	DISCONNECTED = 'disconnected',
}

export interface ConnectionHistory {
	status: ConnectionStatus;
	reportedAt: string;
}

export interface KioskCoordinates {
	latitude: number;
	longitude: number;
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
	connectionHistory?: ConnectionHistory[];
	temperature?: number;
	humidity?: number;
	powerConsumption?: number;
	createdAt: string;
	deletedAt?: string;
	etag: string;
}

