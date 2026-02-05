import { Ad } from '../ads/types';
import { Game } from '../games/types';
import { KioskDevice } from '../kioskDevices/types';
import { Theme } from '../themes/types';


export type OperatingMode = 'pending' | 'selling' | 'adsOnly';
export type KioskType = 'withoutElevator' | 'elevatorWithConveyor' | 'elevatorWithoutConveyor';
export type InterfaceMode = 'normal' | 'focus';

export interface TrayConfiguration {
	row: string; // A, B, C, D, etc.
	device?: KioskDevice; // Device with type 'motor'
	deviceId?: string;
}

export interface KioskTemplate {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive';
	operatingMode?: OperatingMode;
	kioskType?: KioskType;
	interfaceMode?: InterfaceMode;
	slideshow?: Ad; // Playlist trình chiếu
	themeId?: string;
	theme?: Theme;
	gameId?: string;
	game?: Game;
	numberOfTrays?: number;
	trayConfigurations?: TrayConfiguration[];
	createdAt: string;
	etag: string;
}

