import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { productActions } from '../../../appState/product';
import { JsonToString } from '../../../utils/serializer';

import { unitActions, variantActions, type InventoryDispatch } from '../../../appState';
import type { ActionBarFilterConfig } from '../../../components/ActionBar/ActionBar';
import type { Product } from '../types';

type NormalizedProduct = Omit<Product, 'name'> & { name: string };

const STATUS_OPTIONS = [
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
];

const normalizeName = (name: Product['name']) => {
	return JsonToString(name);
};

const normalizeBarcode = (product: Product) => product.barCode ?? '';

function normalizeProduct(product: Product): NormalizedProduct {
	return {
		...product,
		name: normalizeName(product.name),
		barCode: normalizeBarcode(product),
	};
}

function filterProducts(products: NormalizedProduct[], searchValue: string, statusFilters: string[]) {
	const keyword = searchValue.trim().toLowerCase();

	return products.filter((product) => {
		const matchSearch = keyword.length === 0
			|| product.name.toLowerCase().includes(keyword)
			|| (product.sku ?? '').toLowerCase().includes(keyword)
			|| (product.barCode ?? '').toLowerCase().includes(keyword);
		const matchStatus = statusFilters.length === 0
			|| statusFilters.includes(product.status!);

		return matchSearch && matchStatus;
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

	return { page, setPage, pageSize, totalPages, pagedItems, handlePageSizeChange };
}

function buildActionBarFilters(statusFilters: string[], onChange: (value: string[]) => void): ActionBarFilterConfig[] {
	return [{
		value: statusFilters,
		onChange,
		options: STATUS_OPTIONS,
		placeholder: 'Filter status',
		maxValues: 2,
	}];
}


export function useProductListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();

	const orgId = activeOrg?.id ?? 'org-1';

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(productActions.listProducts({ orgId }));
		dispatch(variantActions.listAllVariants(orgId));
		dispatch(unitActions.listUnits(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return {
		handleCreate,
		handleRefresh,
	};
}

export function useProductListView(products: Product[]) {
	const [searchValue, setSearchValue] = React.useState('');
	const [statusFilters, setStatusFilters] = React.useState<string[]>([]);

	const normalizedProducts = React.useMemo(() => {
		return products.map(normalizeProduct);
	}, [products]);

	const filteredProducts = React.useMemo(() => {
		return filterProducts(normalizedProducts, searchValue, statusFilters);
	}, [normalizedProducts, searchValue, statusFilters]);

	const {
		page,
		setPage,
		pageSize,
		totalPages,
		pagedItems,
		handlePageSizeChange,
	} = usePagination(filteredProducts);

	const tableRows = React.useMemo(() => {
		return pagedItems;
	}, [pagedItems]);

	const filters = React.useMemo<ActionBarFilterConfig[]>(() => ([
		...buildActionBarFilters(statusFilters, setStatusFilters),
	]), [statusFilters]);

	return {
		searchValue,
		setSearchValue,
		filters,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		tableRows,
		pagedCount: pagedItems.length,
		filteredCount: filteredProducts.length,
	};
}
