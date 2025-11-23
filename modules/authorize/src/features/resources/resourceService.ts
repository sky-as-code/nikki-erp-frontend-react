import { delay } from '@nikkierp/common/utils';

import { Resource } from './types';
import { fakeActions, fakeResources } from '../../mock/fakeData';


export const resourceService = {
	async listResources(): Promise<Resource[]> {
		await delay(500);
		// Attach actions to resources
		return Promise.resolve(fakeResources.map((resource) => ({
			...resource,
			actions: fakeActions.filter((action) => action.resourceId === resource.id),
		})));
	},

	async getResource(id: string): Promise<Resource | undefined> {
		await delay(500);
		const resource = fakeResources.find((r) => r.id === id);
		if (!resource) return undefined;
		// Attach actions to resource
		return Promise.resolve({
			...resource,
			actions: fakeActions.filter((action) => action.resourceId === resource.id),
		});
	},
};

