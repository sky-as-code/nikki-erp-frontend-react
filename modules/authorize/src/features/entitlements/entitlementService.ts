import { delay } from '@nikkierp/common/utils';

import { Entitlement } from './types';
import { fakeActions, fakeEntitlements, fakeResources } from '../../mock/fakeData';


export const entitlementService = {
	async listEntitlements(): Promise<Entitlement[]> {
		await delay(500);
		// Attach action and resource to entitlements
		return Promise.resolve(fakeEntitlements.map((entitlement) => ({
			...entitlement,
			action: fakeActions.find((a) => a.id === entitlement.actionId),
			resource: fakeResources.find((r) => r.id === entitlement.resourceId),
		})));
	},

	async getEntitlement(id: string): Promise<Entitlement | undefined> {
		await delay(500);
		const entitlement = fakeEntitlements.find((e) => e.id === id);
		if (!entitlement) return undefined;
		// Attach action and resource to entitlement
		return Promise.resolve({
			...entitlement,
			action: fakeActions.find((a) => a.id === entitlement.actionId),
			resource: fakeResources.find((r) => r.id === entitlement.resourceId),
		});
	},
};

