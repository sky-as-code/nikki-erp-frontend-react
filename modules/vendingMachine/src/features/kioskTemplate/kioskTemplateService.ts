import { mockKioskTemplates } from './mockKioskTemplates';
import { KioskTemplate } from './types';


function configFields(dto: KioskTemplate): KioskTemplate {
	return {
		...dto,
	};
}

export const kioskTemplateService = {
	async listKioskTemplates(): Promise<KioskTemplate[]> {
		const result = await mockKioskTemplates.listKioskTemplates();
		return result.map(configFields);
	},

	async getKioskTemplate(id: string): Promise<KioskTemplate | undefined> {
		const result = await mockKioskTemplates.getKioskTemplate(id);
		return result ? configFields(result) : undefined;
	},

	async createKioskTemplate(template: Omit<KioskTemplate, 'id' | 'createdAt' | 'etag'>): Promise<KioskTemplate> {
		const result = await mockKioskTemplates.createKioskTemplate(template);
		return configFields(result);
	},

	async updateKioskTemplate(
		id: string,
		etag: string,
		updates: Partial<Omit<KioskTemplate, 'id' | 'createdAt' | 'etag'>>,
	): Promise<KioskTemplate> {
		const result = await mockKioskTemplates.updateKioskTemplate(id, etag, updates);
		return configFields(result);
	},

	async deleteKioskTemplate(id: string): Promise<void> {
		await mockKioskTemplates.deleteKioskTemplate(id);
	},
};

