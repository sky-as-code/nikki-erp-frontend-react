import { Entitlement } from './types';
import {
	listEntitlements as listEntitlementsApi,
	getEntitlement as getEntitlementApi,
	getEntitlementsByIds as getEntitlementsByIdsApi,
	createEntitlement as createEntitlementApi,
	updateEntitlement as updateEntitlementApi,
	deleteEntitlement as deleteEntitlementApi,
} from '../../services/authzService';


export const entitlementService = {
	async listEntitlements(): Promise<Entitlement[]> {
		const result = await listEntitlementsApi();
		return result.items.map(result => result);
	},

	async getEntitlement(id: string): Promise<Entitlement | undefined> {
		return await getEntitlementApi(id);
	},

	async getEntitlementsByIds(ids: string[]): Promise<Entitlement[]> {
		return await getEntitlementsByIdsApi(ids);
	},

	async createEntitlement(
		entitlement: Entitlement,
	): Promise<Entitlement> {
		return await createEntitlementApi(entitlement);
	},

	async updateEntitlement(
		id: string,
		etag: string,
		data: Entitlement,
	): Promise<Entitlement> {
		return await updateEntitlementApi(id, etag, data);
	},

	async deleteEntitlement(id: string): Promise<void> {
		await deleteEntitlementApi(id);
	},
};
