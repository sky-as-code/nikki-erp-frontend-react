import type { GrantRequest } from './types';

import {
	createGrantRequest as createGrantRequestApi,
	deleteGrantRequest as deleteGrantRequestApi,
	getGrantRequest as getGrantRequestApi,
	listGrantRequests as listGrantRequestsApi,
	respondGrantRequest as respondGrantRequestApi,
	cancelGrantRequest as cancelGrantRequestApi,
} from '@/services/authzService';


export const grantRequestService = {
	async list(): Promise<GrantRequest[]> {
		const result = await listGrantRequestsApi();
		return result.items;
	},

	async get(id: string): Promise<GrantRequest> {
		return getGrantRequestApi(id);
	},

	async create(data: GrantRequest): Promise<GrantRequest> {
		return createGrantRequestApi(data);
	},

	async respond(id: string, decision: 'approve' | 'deny', etag: string, responderId: string): Promise<GrantRequest> {
		return respondGrantRequestApi(id, decision, etag, responderId);
	},

	async cancel(id: string): Promise<void> {
		await cancelGrantRequestApi(id);
	},

	async remove(id: string): Promise<void> {
		await deleteGrantRequestApi(id);
	},
};


