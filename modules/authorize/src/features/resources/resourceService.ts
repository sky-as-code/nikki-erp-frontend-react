import { delay } from '@nikkierp/common/utils';

import { Resource } from './types';
import { fakeResources } from '../../mock/fakeData';


export const resourceService = {
	async listResources(): Promise<Resource[]> {
		await delay(500);
		return Promise.resolve(fakeResources);
	},

	async getResource(id: string): Promise<Resource | undefined> {
		await delay(500);
		return Promise.resolve(fakeResources.find((r) => r.id === id));
	},
};

