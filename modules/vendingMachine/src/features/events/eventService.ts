import { mockEvents } from './mockEvents';
import { Event } from './types';


function configFields(dto: Event): Event {
	return {
		...dto,
	};
}

export const eventService = {
	async listEvents(): Promise<Event[]> {
		const result = await mockEvents.listEvents();
		return result.map(configFields);
	},

	async getEvent(id: string): Promise<Event | undefined> {
		const result = await mockEvents.getEvent(id);
		return result ? configFields(result) : undefined;
	},

	async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'etag'>): Promise<Event> {
		const result = await mockEvents.createEvent(event);
		return configFields(result);
	},

	async updateEvent(
		id: string,
		etag: string,
		updates: Partial<Omit<Event, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Event> {
		const result = await mockEvents.updateEvent(id, etag, updates);
		return configFields(result);
	},

	async deleteEvent(id: string): Promise<void> {
		await mockEvents.deleteEvent(id);
	},
};

