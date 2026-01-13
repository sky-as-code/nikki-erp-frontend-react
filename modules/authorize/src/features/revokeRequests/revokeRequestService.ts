import {
	listRevokeRequests as listRevokeRequestsApi,
	getRevokeRequest as getRevokeRequestApi,
	createRevokeRequest as createRevokeRequestApi,
	bulkCreateRevokeRequests as bulkCreateRevokeRequestsApi,
	deleteRevokeRequest as deleteRevokeRequestApi,
	type AuthzRevokeRequestDto,
	type AuthzBulkRevokeRequestInputDto,
} from '@/services/authzService';

import type { RevokeRequest } from './types';

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


function mapDtoToRevokeRequest(dto: AuthzRevokeRequestDto): RevokeRequest {
	return {
		id: dto.id,
		etag: dto.etag,
		requestorId: dto.requestorId || dto.requestor?.id,
		requestor: dto.requestor,
		receiverType: dto.receiverType as RevokeRequest['receiverType'],
		receiverId: dto.receiverId,
		receiver: dto.receiver,
		targetType: dto.targetType as RevokeRequest['targetType'],
		targetRef: dto.targetRef || dto.target?.id || '',
		target: dto.target,
		targetId: dto.targetId || dto.target?.id,
		attachmentUrl: dto.attachmentUrl,
		comment: dto.comment,
		createdAt: dto.createdAt,
	};
}

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
	async list(params?: { graph?: Record<string, unknown>; page?: number; size?: number }): Promise<RevokeRequest[]> {
		const result = await listRevokeRequestsApi(params);
		return result.items.map(mapDtoToRevokeRequest);
	},

	async get(id: string): Promise<RevokeRequest | undefined> {
		const dto = await getRevokeRequestApi(id);
		return mapDtoToRevokeRequest(dto);
	},

	async create(input: CreateRevokeRequestInput): Promise<RevokeRequest> {
		const dto = await createRevokeRequestApi(mapCreateInputToDto(input));
		return mapDtoToRevokeRequest(dto);
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
				await revokeRequestService.create(items[0]);
			}
			return { count: items.length };
		}
		return revokeRequestService.createBulk(items);
	},

	async remove(id: string): Promise<void> {
		await deleteRevokeRequestApi(id);
	},
};

