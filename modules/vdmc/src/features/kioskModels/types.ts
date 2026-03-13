import { KioskDevice } from '../kioskDevices/types';

export type OperatingMode = 'pending' | 'selling' | 'adsOnly';
export type KioskType = 'withoutElevator' | 'elevatorWithConveyor' | 'elevatorWithoutConveyor';
export type InterfaceMode = 'normal' | 'focus';

export interface TrayConfiguration {
	row: string; // A, B, C, D, etc.
	device?: KioskDevice; // Device with type 'motor'
	deviceId?: string;
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

