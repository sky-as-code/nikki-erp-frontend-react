import { delay } from '@nikkierp/common/utils';

import { Action } from './types';
import { fakeActions, fakeResources } from '../../mock/fakeData';


export const actionService = {
	async listActions(): Promise<Action[]> {
		await delay(500);
		// Attach resource to actions
		return Promise.resolve(fakeActions.map((action) => ({
			...action,
			resource: fakeResources.find((r) => r.id === action.resourceId),
		})));
	},

	async getAction(id: string): Promise<Action | undefined> {
		await delay(500);
		const action = fakeActions.find((a) => a.id === id);
		if (!action) return undefined;
		// Attach resource to action
		return Promise.resolve({
			...action,
			resource: fakeResources.find((r) => r.id === action.resourceId),
		});
	},
};

