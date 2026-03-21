import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitCategoryActions } from '../../../appState';

import type { InventoryDispatch } from '../../../appState';


export const PAGE_SIZE_OPTIONS = [
	{ value: '5', label: '5 / page' },
	{ value: '10', label: '10 / page' },
	{ value: '20', label: '20 / page' },
	{ value: '50', label: '50 / page' },
];

const normalizeText = (value?: string | null) => (value ?? '').toLowerCase();

function filterCategories(
	categories: unknown[],
	searchValue: string,
) {
	const keyword = searchValue.trim().toLowerCase();
	if (!keyword) {
		return categories;
	}

	return categories.filter((category: any) => {
		return normalizeText(category.name).includes(keyword);
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

export function useUnitCategoryListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const handleOpenCreatePage = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(unitCategoryActions.listUnitCategories(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return {
		handleOpenCreatePage,
		handleRefresh,
	};
}

export function useUnitCategoryListView(categories: unknown[]) {
	const [searchValue, setSearchValue] = React.useState('');

	const filteredCategories = React.useMemo(() => {
		return filterCategories(categories, searchValue);
	}, [categories, searchValue]);

	const {
		page,
		setPage,
		pageSize,
		totalPages,
		pagedItems,
		handlePageSizeChange,
	} = usePagination(filteredCategories);

	return {
		searchValue,
		setSearchValue,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		pagedCategories: pagedItems,
		filteredCount: filteredCategories.length,
		pagedCount: pagedItems.length,
	};
}
