import { mockSlideshows } from './mockSlideshows';
import { Slideshow } from './types';

function configFields(dto: Slideshow): Slideshow {
	return { ...dto };
}

export const slideshowService = {
	async listSlideshows(): Promise<Slideshow[]> {
		const result = await mockSlideshows.listSlideshows();
		return result.map(configFields);
	},
	async getSlideshow(id: string): Promise<Slideshow | undefined> {
		const result = await mockSlideshows.getSlideshow(id);
		return result ? configFields(result) : undefined;
	},
	async createSlideshow(slideshow: Omit<Slideshow, 'id' | 'createdAt' | 'etag'>): Promise<Slideshow> {
		const result = await mockSlideshows.createSlideshow(slideshow);
		return configFields(result);
	},
	async updateSlideshow(id: string, etag: string, updates: Partial<Omit<Slideshow, 'id' | 'createdAt' | 'etag'>>): Promise<Slideshow> {
		const result = await mockSlideshows.updateSlideshow(id, etag, updates);
		return configFields(result);
	},
	async deleteSlideshow(id: string): Promise<void> {
		await mockSlideshows.deleteSlideshow(id);
	},
};
