import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitActions } from '../../../appState/unit';
import { unitCategoryActions } from '../../../appState/unitCategory';

import type { InventoryDispatch } from '../../../appState';
import type { Unit } from '../types';
import type { UnitCategory } from '../../unitCategory/types';


export const PAGE_SIZE_OPTIONS = [
	{ value: '5', label: '5 / page' },
	{ value: '10', label: '10 / page' },
	{ value: '20', label: '20 / page' },
	{ value: '50', label: '50 / page' },
];

function filterUnits(units: Unit[], searchValue: string) {
	const keyword = searchValue.trim().toLowerCase();
	if (!keyword) {
		return units;
	}

	return units.filter((unit) => {
		const symbol = unit.symbol ?? unit.code ?? '';
		const category = unit.categoryId ?? unit.category ?? '';
		return unit.name.toLowerCase().includes(keyword)
			|| symbol.toLowerCase().includes(keyword)
			|| category.toLowerCase().includes(keyword);
	});
}

function usePagination<T>(items: T[]) {
	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(10);

	const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

	React.useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, totalPages]);

	const pageStart = (page - 1) * pageSize;
	const pagedItems = React.useMemo(() => {
		return items.slice(pageStart, pageStart + pageSize);
	}, [items, pageSize, pageStart]);

	const handlePageSizeChange = React.useCallback((value: string | null) => {
		const parsed = Number(value ?? 10);
		setPageSize(parsed);
		setPage(1);
	}, []);

	return {
		page,
		setPage,
		pageSize,
		totalPages,
		pagedItems,
		handlePageSizeChange,
	};
}

export function useUnitListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(unitActions.listUnits());
		dispatch(unitCategoryActions.listUnitCategories(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return {
		handleCreate,
		handleRefresh,
	};
}

export function useUnitListView(units: Unit[], unitCategories: UnitCategory[]) {
	const [searchValue, setSearchValue] = React.useState('');

	const filteredUnits = React.useMemo(() => {
		return filterUnits(units, searchValue);
	}, [units, searchValue]);

	const {
		page,
		setPage,
		pageSize,
		totalPages,
		pagedItems,
		handlePageSizeChange,
	} = usePagination(filteredUnits);

	const categoryMap = React.useMemo(() => {
		return new Map(unitCategories.map((category) => [category.id, category]));
	}, [unitCategories]);

	const columnRenderers = React.useMemo(() => ({
		categoryId: (row: Record<string, unknown>) => {
			const categoryId = row.categoryId as string | null | undefined;
			if (!categoryId) {
				return '-';
			}
			return categoryMap.get(categoryId)?.name ?? categoryId;
		},
	}), [categoryMap]);

	return {
		searchValue,
		setSearchValue,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		pagedUnits: pagedItems,
		pagedCount: pagedItems.length,
		filteredCount: filteredUnits.length,
		columnRenderers,
	};
}
