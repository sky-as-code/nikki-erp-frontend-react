import { mockKioskDevices } from './mockKioskDevices';
import { KioskDevice } from './types';


function configFields(dto: KioskDevice): KioskDevice {
	return {
		...dto,
	};
}

export const kioskDeviceService = {
	async listKioskDevices(): Promise<KioskDevice[]> {
		const result = await mockKioskDevices.listKioskDevices();
		return result.map(configFields);
	},

	async getKioskDevice(id: string): Promise<KioskDevice | undefined> {
		const result = await mockKioskDevices.getKioskDevice(id);
		return result ? configFields(result) : undefined;
	},

	async createKioskDevice(kioskDevice: Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>): Promise<KioskDevice> {
		const result = await mockKioskDevices.createKioskDevice(kioskDevice);
		return configFields(result);
	},

	async updateKioskDevice(
		id: string,
		etag: string,
		updates: Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>>,
	): Promise<KioskDevice> {
		const result = await mockKioskDevices.updateKioskDevice(id, etag, updates);
		return configFields(result);
	},

	async deleteKioskDevice(id: string): Promise<void> {
		await mockKioskDevices.deleteKioskDevice(id);
	},
};
