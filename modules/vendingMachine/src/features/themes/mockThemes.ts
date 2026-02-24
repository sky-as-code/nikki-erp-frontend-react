import { Theme } from './types';

// Mock data for themes
const mockThemesData: Theme[] = [
	{
		id: '1',
		code: 'THEME-001',
		name: 'Theme Xanh Dương',
		description: 'Theme với màu xanh dương chủ đạo, phù hợp cho mùa hè',
		status: 'active',
		primaryColor: '#1E90FF',
		productCardStyle: 'default',
		appBackground: 'snow',
		fontStyle: 'roboto',
		mascotImage: 'https://via.placeholder.com/200',
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-theme-001',
	},
	{
		id: '2',
		code: 'THEME-002',
		name: 'Theme Tết Nguyên Đán',
		description: 'Theme đặc biệt cho dịp Tết với hiệu ứng pháo hoa',
		status: 'active',
		primaryColor: '#FF6B6B',
		productCardStyle: 'elegant',
		appBackground: 'fireworks',
		fontStyle: 'poppins',
		mascotImage: 'https://via.placeholder.com/200',
		createdAt: '2024-01-15T09:30:00Z',
		etag: 'etag-theme-002',
	},
	{
		id: '3',
		code: 'THEME-003',
		name: 'Theme Minimal',
		description: 'Theme tối giản, hiện đại',
		status: 'inactive',
		primaryColor: '#2C3E50',
		productCardStyle: 'minimal',
		appBackground: 'none',
		fontStyle: 'inter',
		mascotImage: 'https://via.placeholder.com/200',
		createdAt: '2024-02-01T10:15:00Z',
		etag: 'etag-theme-003',
	},
	{
		id: '4',
		code: 'THEME-004',
		name: 'Theme Gradient',
		description: 'Theme với background gradient đẹp mắt',
		status: 'active',
		primaryColor: '#9B59B6',
		productCardStyle: 'modern',
		appBackground: 'gradient',
		fontStyle: 'montserrat',
		mascotImage: 'https://via.placeholder.com/200',
		createdAt: '2024-02-10T14:20:00Z',
		etag: 'etag-theme-004',
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockThemes = {
	async listThemes(): Promise<Theme[]> {
		await delay(500);
		return [...mockThemesData];
	},

	async getTheme(id: string): Promise<Theme | undefined> {
		await delay(300);
		return mockThemesData.find((t) => t.id === id);
	},

	async createTheme(theme: Omit<Theme, 'id' | 'createdAt' | 'etag'>): Promise<Theme> {
		await delay(500);
		const newTheme: Theme = {
			...theme,
			id: String(mockThemesData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-theme-${Date.now()}`,
		};
		mockThemesData.push(newTheme);
		return newTheme;
	},

	async updateTheme(
		id: string,
		etag: string,
		updates: Partial<Omit<Theme, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Theme> {
		await delay(500);
		const index = mockThemesData.findIndex((t) => t.id === id);
		if (index === -1) {
			throw new Error('Theme not found');
		}
		const updatedTheme: Theme = {
			...mockThemesData[index],
			...updates,
			etag: `etag-theme-${Date.now()}`,
		};
		mockThemesData[index] = updatedTheme;
		return updatedTheme;
	},

	async deleteTheme(id: string): Promise<void> {
		await delay(500);
		const index = mockThemesData.findIndex((t) => t.id === id);
		if (index === -1) {
			throw new Error('Theme not found');
		}
		mockThemesData.splice(index, 1);
	},
};
