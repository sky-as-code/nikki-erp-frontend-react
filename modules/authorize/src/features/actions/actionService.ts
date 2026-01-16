import {
	listActions as listActionsApi,
	getAction as getActionApi,
	createAction as createActionApi,
	updateAction as updateActionApi,
	deleteAction as deleteActionApi,
	type AuthzActionDto,
} from '@/services/authzService';

import { Action } from './types';


function mapDtoToAction(dto: AuthzActionDto): Action {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		resourceId: dto.resourceId,
		createdAt: dto.createdAt,
		createdBy: dto.createdBy,
		entitlementsCount: dto.entitlementsCount || 0,
		etag: dto.etag,
	};
}

function mapActionToDto(action: Partial<Action>): Partial<AuthzActionDto> {
	return {
		id: action.id,
		name: action.name,
		description: action.description,
		resourceId: action.resourceId,
		createdAt: action.createdAt,
		etag: action.etag,
		createdBy: action.createdBy,
		entitlementsCount: action.entitlementsCount || 0,
	};
}

export const actionService = {
	async listActions(): Promise<Action[]> {
		const result = await listActionsApi();
		return result.items.map(mapDtoToAction);
	},

	async getAction(actionId: string): Promise<Action | undefined> {
		const dto = await getActionApi(actionId);
		return mapDtoToAction(dto);
	},

	async createAction(
		action: Omit<Action, 'id' | 'createdAt' | 'etag' | 'resources' | 'entitlementsCount'>,
	): Promise<Action> {
		const dto = await createActionApi(mapActionToDto(action) as Omit<AuthzActionDto, 'id' | 'createdAt' | 'etag' | 'createdBy' | 'entitlementsCount'>);
		return mapDtoToAction(dto);
	},

	async updateAction(
		actionId: string,
		data: {etag: string, description?: string},
	): Promise<Action> {
		const dto = await updateActionApi(actionId, data);
		return mapDtoToAction(dto);
	},

	async deleteAction(actionId: string): Promise<void> {
		await deleteActionApi(actionId);
	},
};
