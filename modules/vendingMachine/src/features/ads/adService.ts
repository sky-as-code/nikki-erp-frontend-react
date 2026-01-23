import { mockAds } from './mockAds';
import { Ad } from './types';


function configFields(dto: Ad): Ad {
	return {
		...dto,
	};
}

export const adService = {
	async listAds(): Promise<Ad[]> {
		const result = await mockAds.listAds();
		return result.map(configFields);
	},

	async getAd(id: string): Promise<Ad | undefined> {
		const result = await mockAds.getAd(id);
		return result ? configFields(result) : undefined;
	},

	async createAd(ad: Omit<Ad, 'id' | 'createdAt' | 'etag'>): Promise<Ad> {
		const result = await mockAds.createAd(ad);
		return configFields(result);
	},

	async updateAd(
		id: string,
		etag: string,
		updates: Partial<Omit<Ad, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Ad> {
		const result = await mockAds.updateAd(id, etag, updates);
		return configFields(result);
	},

	async deleteAd(id: string): Promise<void> {
		await mockAds.deleteAd(id);
	},
};

