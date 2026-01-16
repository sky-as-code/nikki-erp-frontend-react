import {
	createGrantRequest as createGrantRequestApi,
	deleteGrantRequest as deleteGrantRequestApi,
	getGrantRequest as getGrantRequestApi,
	listGrantRequests as listGrantRequestsApi,
	respondGrantRequest as respondGrantRequestApi,
	cancelGrantRequest as cancelGrantRequestApi,
	type AuthzGrantRequestDto,
} from '@/services/authzService';

import type { GrantRequest } from './types';


function mapDtoToGrantRequest(dto: AuthzGrantRequestDto): GrantRequest {
	return {
		id: dto.id,
		attachmentUrl: dto.attachmentUrl,
		comment: dto.comment,
		targetType: dto.targetType as GrantRequest['targetType'],
		targetRef: dto.targetRef,
		responseId: dto.responseId,
		status: dto.status as GrantRequest['status'],
		orgId: dto.orgId,
		createdAt: dto.createdAt,
		approver: dto.approver,
		requestor: dto.requestor,
		receiver: dto.receiver,
		target: dto.target,
		etag: dto.etag,
		receiverType: dto.receiverType as GrantRequest['receiverType'],
	};
}

export const grantRequestService = {
	async list(): Promise<GrantRequest[]> {
		const result = await listGrantRequestsApi();
		return result.items.map(mapDtoToGrantRequest);
	},

	async get(id: string): Promise<GrantRequest | undefined> {
		const dto = await getGrantRequestApi(id);
		return mapDtoToGrantRequest(dto);
	},

	async create(data: Partial<GrantRequest>): Promise<GrantRequest> {
		const dto = await createGrantRequestApi(data as Partial<AuthzGrantRequestDto>);
		return mapDtoToGrantRequest(dto);
	},

	async respond(id: string, decision: 'approve' | 'deny', etag: string, responderId: string): Promise<GrantRequest> {
		const dto = await respondGrantRequestApi(id, decision, etag, responderId);
		return mapDtoToGrantRequest(dto);
	},

	async cancel(id: string): Promise<void> {
		await cancelGrantRequestApi(id);
	},

	async remove(id: string): Promise<void> {
		await deleteGrantRequestApi(id);
	},
};


