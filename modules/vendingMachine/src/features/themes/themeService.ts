import { mockThemes } from './mockThemes';
import { Theme } from './types';


function configFields(dto: Theme): Theme {
	return {
		...dto,
	};
}

export const themeService = {
	async listThemes(): Promise<Theme[]> {
		const result = await mockThemes.listThemes();
		return result.map(configFields);
	},

	async getTheme(id: string): Promise<Theme | undefined> {
		const result = await mockThemes.getTheme(id);
		return result ? configFields(result) : undefined;
	},

	async createTheme(theme: Omit<Theme, 'id' | 'createdAt' | 'etag'>): Promise<Theme> {
		const result = await mockThemes.createTheme(theme);
		return configFields(result);
	},

	async updateTheme(
		id: string,
		etag: string,
		updates: Partial<Omit<Theme, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Theme> {
		const result = await mockThemes.updateTheme(id, etag, updates);
		return configFields(result);
	},

	async deleteTheme(id: string): Promise<void> {
		await mockThemes.deleteTheme(id);
	},
};
