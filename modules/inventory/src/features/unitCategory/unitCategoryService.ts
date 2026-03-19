import * as request from '@nikkierp/common/request';

import type {
	CreateUnitCategoryRequest,
	CreateUnitCategoryResponse,
	DeleteUnitCategoryResponse,
	SearchUnitCategoriesResponse,
	UnitCategory,
	UpdateUnitCategoryRequest,
	UpdateUnitCategoryResponse,
} from './types';

export const unitCategoryService = {
	async listUnitCategories(orgId: string): Promise<SearchUnitCategoriesResponse> {
		const response = await request.get<SearchUnitCategoriesResponse>(
			`${orgId}/inventory/unit-category`,
		);
		return response;
	},

	async getUnitCategory(orgId: string, id: string): Promise<UnitCategory> {
		const response = await request.get<UnitCategory>(`${orgId}/inventory/unit-category/${id}`);
		return response;
	},

	async createUnitCategory(orgId: string, data: CreateUnitCategoryRequest): Promise<CreateUnitCategoryResponse> {
		const response = await request.post<CreateUnitCategoryResponse>(
			`${orgId}/inventory/unit-category`,
			{ json: data }
		);
		return response;
	},

	async updateUnitCategory(orgId: string, data: UpdateUnitCategoryRequest): Promise<UpdateUnitCategoryResponse> {
		const response = await request.put<UpdateUnitCategoryResponse>(
			`${orgId}/inventory/unit-category/${data.id}`,
			{ json: data }
		);
		return response;
	},

	async deleteUnitCategory(orgId: string, id: string): Promise<DeleteUnitCategoryResponse> {
		const response = await request.del<DeleteUnitCategoryResponse>(
			`${orgId}/inventory/unit-category/${id}`
		);
		return response;
	},
};
