import { mockKiosks } from './mockKiosks';
import { Kiosk } from './types';


function configFields(dto: Kiosk): Kiosk {
	return {
		...dto,
	};
}

export const kioskService = {
	async listKiosks(): Promise<Kiosk[]> {
		const result = await mockKiosks.listKiosks();
		return result.map(configFields);
	},

	async getKiosk(id: string): Promise<Kiosk | undefined> {
		const result = await mockKiosks.getKiosk(id);
		return result ? configFields(result) : undefined;
	},

	async createKiosk(kiosk: Omit<Kiosk, 'id' | 'createdAt' | 'etag'>): Promise<Kiosk> {
		const result = await mockKiosks.createKiosk(kiosk);
		return configFields(result);
	},

	async updateKiosk(
		id: string,
		etag: string,
		updates: Partial<Omit<Kiosk, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Kiosk> {
		const result = await mockKiosks.updateKiosk(id, etag, updates);
		return configFields(result);
	},

	async deleteKiosk(id: string): Promise<void> {
		await mockKiosks.deleteKiosk(id);
	},
};

