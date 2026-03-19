import * as request from '@nikkierp/common/request';

import type {
	CreateUnitRequest,
	CreateUnitResponse,
	DeleteUnitResponse,
	SearchUnitsResponse,
	Unit,
	UpdateUnitRequest,
	UpdateUnitResponse,
} from './types';

export const unitService = {
	async listUnits(orgId: string): Promise<SearchUnitsResponse> {
		const response = await request.get<SearchUnitsResponse>(
			`${orgId}/inventory/units`
		);
		return response;
	},

	async getUnit(orgId: string, id: string): Promise<Unit> {
		const response = await request.get<Unit>(
			`${orgId}/inventory/units/${id}`
		);
		return response;
	},

	async createUnit(orgId: string, data: CreateUnitRequest): Promise<CreateUnitResponse> {
		const response = await request.post<CreateUnitResponse>(
			`${orgId}/inventory/units`,
			{ json: data }
		);
		return response;
	},

	async updateUnit(orgId: string, data: UpdateUnitRequest): Promise<UpdateUnitResponse> {
		const response = await request.put<UpdateUnitResponse>(
			`${orgId}/inventory/units/${data.id}`,
			{ json: data }
		);
		return response;
	},

	async deleteUnit(orgId: string, id: string): Promise<DeleteUnitResponse> {
		const response = await request.del<DeleteUnitResponse>(
			`${orgId}/inventory/units/${id}`
		);
		return response;
	},
};
