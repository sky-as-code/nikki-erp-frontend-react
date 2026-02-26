import { mockSettings } from './mockSettings';
import { Setting } from './types';


function configFields(dto: Setting): Setting {
	return {
		...dto,
	};
}

export const settingService = {
	async listSettings(): Promise<Setting[]> {
		const result = await mockSettings.listSettings();
		return result.map(configFields);
	},

	async getSetting(id: string): Promise<Setting | undefined> {
		const result = await mockSettings.getSetting(id);
		return result ? configFields(result) : undefined;
	},

	async createSetting(setting: Omit<Setting, 'id' | 'createdAt' | 'etag'>): Promise<Setting> {
		const result = await mockSettings.createSetting(setting);
		return configFields(result);
	},

	async updateSetting(
		id: string,
		etag: string,
		updates: Partial<Omit<Setting, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Setting> {
		const result = await mockSettings.updateSetting(id, etag, updates);
		return configFields(result);
	},

	async deleteSetting(id: string): Promise<void> {
		await mockSettings.deleteSetting(id);
	},
};
