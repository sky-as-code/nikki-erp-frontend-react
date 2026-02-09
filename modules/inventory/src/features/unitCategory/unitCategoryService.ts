import {
	mockUnitCategoriesData,
	nextEtag,
	nextId,
	nowIso,
	waitMock,
} from '../../mockData';

import type {
	CreateUnitCategoryRequest,
	CreateUnitCategoryResponse,
	DeleteUnitCategoryResponse,
	SearchUnitCategoriesResponse,
	UnitCategory,
	UpdateUnitCategoryRequest,
	UpdateUnitCategoryResponse,
} from './types';


const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const normalizeCategory = (category: UnitCategory): UnitCategory => {
	return {
		...category,
		orgId: category.orgId ?? 'org-1',
		status: category.status ?? 'active',
		thumbnailURL: category.thumbnailURL ?? '',
	};
};

export const unitCategoryService = {
	async listUnitCategories(orgId: string): Promise<SearchUnitCategoriesResponse> {
		await waitMock();
		const items = mockUnitCategoriesData
			.filter((category) => category.orgId === orgId)
			.map(normalizeCategory);
		return {
			items: clone(items),
			total: items.length,
			page: 1,
			size: items.length,
		};
	},

	async getUnitCategory(id: string): Promise<UnitCategory> {
		await waitMock();
		const category = mockUnitCategoriesData.find((item) => item.id === id);
		if (!category) {
			throw new Error('Unit category not found');
		}
		return clone(normalizeCategory(category));
	},

	async createUnitCategory(data: CreateUnitCategoryRequest): Promise<CreateUnitCategoryResponse> {
		await waitMock();
		const createdAt = nowIso();
		const id = nextId('ucat', mockUnitCategoriesData);
		const category: UnitCategory = {
			id,
			orgId: data.orgId ?? 'org-1',
			name: data.name,
			description: data.description,
			status: data.status ?? 'active',
			thumbnailURL: data.thumbnailURL ?? '',
			createdAt,
			updatedAt: createdAt,
			etag: nextEtag(),
		};

		mockUnitCategoriesData.push(category);

		return {
			id,
			etag: category.etag,
			createdAt: new Date(createdAt),
		};
	},

	async updateUnitCategory(data: UpdateUnitCategoryRequest): Promise<UpdateUnitCategoryResponse> {
		await waitMock();

		const index = mockUnitCategoriesData.findIndex((item) => item.id === data.id);
		if (index < 0) {
			throw new Error('Unit category not found');
		}

		const current = normalizeCategory(mockUnitCategoriesData[index]);

		const updatedAt = nowIso();
		const updated: UnitCategory = {
			...current,
			...data,
			orgId: data.orgId ?? current.orgId ?? 'org-1',
			status: data.status ?? current.status ?? 'active',
			thumbnailURL: data.thumbnailURL ?? current.thumbnailURL ?? '',
			updatedAt,
			etag: nextEtag(),
		};

		mockUnitCategoriesData[index] = updated;

		return {
			id: updated.id,
			etag: updated.etag,
			updatedAt: new Date(updatedAt),
		};
	},

	async deleteUnitCategory(id: string): Promise<DeleteUnitCategoryResponse> {
		await waitMock();

		const index = mockUnitCategoriesData.findIndex((item) => item.id === id);
		if (index >= 0) {
			mockUnitCategoriesData.splice(index, 1);
		}

		return {
			id,
			deletedAt: new Date(),
		};
	},
};
