import { Action } from './types';

import {
	listActions as listActionsApi,
	getAction as getActionApi,
	createAction as createActionApi,
	updateAction as updateActionApi,
	deleteAction as deleteActionApi,
} from '@/services/authzService';


function mapDtoToAction(dto: Action): Action {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		resourceId: dto.resourceId,
		resource: dto.resource,
		createdAt: dto.createdAt,
		createdBy: dto.createdBy,
		entitlementsCount: dto.entitlementsCount || 0,
		etag: dto.etag,
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
		data: Action,
	): Promise<Action> {
		const dto = await createActionApi(data);
		return mapDtoToAction(dto);
	},

	async updateAction(
		actionId: string,
		data: Action,
	): Promise<Action> {
		const dto = await updateActionApi(actionId, data);
		return mapDtoToAction(dto);
	},

	async deleteAction(actionId: string): Promise<void> {
		await deleteActionApi(actionId);
	},
};
