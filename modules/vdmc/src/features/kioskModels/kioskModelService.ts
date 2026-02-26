import { mockKioskModels } from './mockKioskModels';
import { KioskModel } from './types';


function configFields(dto: KioskModel): KioskModel {
	return {
		...dto,
	};
}

export const kioskModelService = {
	async listKioskModels(): Promise<KioskModel[]> {
		const result = await mockKioskModels.listKioskModels();
		return result.map(configFields);
	},

	async getKioskModel(id: string): Promise<KioskModel | undefined> {
		const result = await mockKioskModels.getKioskModel(id);
		return result ? configFields(result) : undefined;
	},

	async createKioskModel(model: Omit<KioskModel, 'id' | 'createdAt' | 'etag'>): Promise<KioskModel> {
		const result = await mockKioskModels.createKioskModel(model);
		return configFields(result);
	},

	async updateKioskModel(
		id: string,
		etag: string,
		updates: Partial<Omit<KioskModel, 'id' | 'createdAt' | 'etag'>>,
	): Promise<KioskModel> {
		const result = await mockKioskModels.updateKioskModel(id, etag, updates);
		return configFields(result);
	},

	async deleteKioskModel(id: string): Promise<void> {
		await mockKioskModels.deleteKioskModel(id);
	},
};
