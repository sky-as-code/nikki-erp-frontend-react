import { mockKiosks } from '@/features/kiosks/mocks';

import { Kiosk } from './types';


export type ListKiosksParams = { page?: number; size?: number; graph?: string };
export type PagedKioskResult = { items: Kiosk[]; total: number; page: number; size: number };

function configFields(dto: Kiosk): Kiosk {
	return {
		...dto,
	};
}

export const kioskService = {
	async listKiosks(params?: ListKiosksParams): Promise<PagedKioskResult> {
		const result = await mockKiosks.listKiosks(params?.page, params?.size);
		return { ...result, items: result.items.map(configFields) };
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

