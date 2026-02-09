import {
	mockUnitsData,
	nextEtag,
	nowIso,
	waitMock,
} from '../../mockData';

import type {
	CreateUnitRequest,
	CreateUnitResponse,
	DeleteUnitResponse,
	SearchUnitsResponse,
	Unit,
	UpdateUnitRequest,
	UpdateUnitResponse,
} from './types';


const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const normalizeUnit = (unit: Unit): Unit => {
	const symbol = unit.symbol ?? unit.code ?? '';
	const categoryId = unit.categoryId ?? unit.category ?? 'ucat-1';
	const baseUnit = unit.baseUnit ?? unit.baseUnitId;
	const multiplier = unit.multiplier ?? unit.conversionRatio ?? 1;

	return {
		...unit,
		symbol,
		categoryId,
		orgId: unit.orgId ?? 'org-1',
		baseUnit,
		multiplier,
		status: unit.status ?? 'active',
	};
};

export const unitService = {
	async listUnits(): Promise<SearchUnitsResponse> {
		await waitMock();
		const items = mockUnitsData.map(normalizeUnit);
		return {
			items: clone(items),
			total: items.length,
			page: 1,
			size: items.length,
		};
	},

	async getUnit(id: string): Promise<Unit> {
		await waitMock();
		const unit = mockUnitsData.find((item) => item.id === id);
		if (!unit) {
			throw new Error('Unit not found');
		}
		return clone(normalizeUnit(unit));
	},

	async createUnit(data: CreateUnitRequest): Promise<CreateUnitResponse> {
		await waitMock();
		const id = `uom-${Date.now()}`;
		const createdAt = nowIso();
		const symbol = data.symbol ?? data.code ?? '';
		const categoryId = data.categoryId ?? data.category ?? 'ucat-1';
		const baseUnit = data.baseUnit ?? data.baseUnitId;
		const multiplier = data.multiplier ?? data.conversionRatio ?? 1;
		const unit: Unit = {
			id,
			name: data.name,
			symbol,
			categoryId,
			orgId: data.orgId ?? 'org-1',
			baseUnit,
			multiplier,
			status: data.status ?? 'active',
			createdAt,
			updatedAt: createdAt,
			etag: nextEtag(),
		};
		mockUnitsData.push(unit);
		return {
			id,
			etag: unit.etag,
			createdAt: new Date(createdAt),
		};
	},

	async updateUnit(data: UpdateUnitRequest): Promise<UpdateUnitResponse> {
		await waitMock();
		const index = mockUnitsData.findIndex((unit) => unit.id === data.id);
		if (index < 0) {
			throw new Error('Unit not found');
		}
		const updatedAt = nowIso();
		const current = normalizeUnit(mockUnitsData[index]);
		const symbol = data.symbol ?? data.code ?? current.symbol;
		const categoryId = data.categoryId ?? data.category ?? current.categoryId;
		const baseUnit = data.baseUnit ?? data.baseUnitId ?? current.baseUnit;
		const multiplier = data.multiplier ?? data.conversionRatio ?? current.multiplier;
		const updated: Unit = {
			...current,
			...data,
			symbol,
			categoryId,
			baseUnit,
			multiplier,
			orgId: data.orgId ?? current.orgId ?? 'org-1',
			status: data.status ?? current.status ?? 'active',
			updatedAt,
			etag: nextEtag(),
		};
		mockUnitsData[index] = updated;
		return {
			id: updated.id,
			etag: updated.etag,
			updatedAt: new Date(updatedAt),
		};
	},

	async deleteUnit(id: string): Promise<DeleteUnitResponse> {
		await waitMock();
		const index = mockUnitsData.findIndex((unit) => unit.id === id);
		if (index >= 0) {
			mockUnitsData.splice(index, 1);
		}
		return {
			id,
			deletedAt: new Date(),
		};
	},
};
