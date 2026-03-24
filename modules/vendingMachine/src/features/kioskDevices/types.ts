export type KioskDeviceType = 'motor' | 'pos' | 'screen' | 'cpu' | 'router';

export type KioskDeviceStatus = 'active' | 'inactive';

export interface KioskDeviceSpecification {
	key: string;
	value: string;
}

export interface KioskDevice {
	id: string;
	code: string;
	name: string;
	status: KioskDeviceStatus;
	deviceType: KioskDeviceType;
	description?: string;
	specifications: KioskDeviceSpecification[];
	createdAt: string;
	etag: string;
}
