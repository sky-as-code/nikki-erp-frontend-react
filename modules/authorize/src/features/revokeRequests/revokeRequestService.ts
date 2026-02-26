import type { RevokeRequest } from './types';
import type { ListQuery } from '@/services/authzService';

import {
	listRevokeRequests as listRevokeRequestsApi,
	getRevokeRequest as getRevokeRequestApi,
	createRevokeRequest as createRevokeRequestApi,
	bulkCreateRevokeRequests as bulkCreateRevokeRequestsApi,
	deleteRevokeRequest as deleteRevokeRequestApi,
	type AuthzBulkRevokeRequestInputDto,
} from '@/services/authzService';


export type CreateRevokeRequestInput = {
	attachmentUrl?: string;
	comment?: string;
	requestorId: string;
	receiverType: RevokeRequest['receiverType'];
	receiverId: string;
	targetType: RevokeRequest['targetType'];
	targetRef: string;
};

export type BulkCreateResult = {
	count: number;
};

function mapCreateInputToDto(input: CreateRevokeRequestInput): AuthzBulkRevokeRequestInputDto {
	return {
		attachmentUrl: input.attachmentUrl,
		comment: input.comment,
		requestorId: input.requestorId,
		receiverType: input.receiverType,
		receiverId: input.receiverId,
		targetType: input.targetType,
		targetRef: input.targetRef,
	};
}

export const revokeRequestService = {
	async list(params?: ListQuery): Promise<RevokeRequest[]> {
		const result = await listRevokeRequestsApi(params);
		return result.items;
	},

	async get(id: string): Promise<RevokeRequest> {
		return getRevokeRequestApi(id);
	},

	async create(data: RevokeRequest): Promise<RevokeRequest> {
		return createRevokeRequestApi(data);
	},

	async createBulk(items: CreateRevokeRequestInput[]): Promise<BulkCreateResult> {
		const dto = await bulkCreateRevokeRequestsApi({
			items: items.map(mapCreateInputToDto),
		});
		return { count: dto.items.length };
	},

	async createSmart(items: CreateRevokeRequestInput[]): Promise<BulkCreateResult> {
		if (items.length <= 1) {
			if (items.length === 1) {
				await revokeRequestService.create(items[0] as RevokeRequest);
			}
			return { count: items.length };
		}
		return revokeRequestService.createBulk(items);
	},

	async remove(id: string): Promise<void> {
		await deleteRevokeRequestApi(id);
	},
};

