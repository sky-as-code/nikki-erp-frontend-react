import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { productActions } from '../../../appState/product';
import { variantActions } from '../../../appState/variant';
import { localizedTextToString } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';
import type { ActionBarFilterConfig } from '../../../components/ActionBar/ActionBar';
import type { Product } from '../../product/types';
import type { Variant } from '../types';


const STATUS_OPTIONS = [
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
];

export const PAGE_SIZE_OPTIONS = [
	{ value: '10', label: '10 / page' },
	{ value: '20', label: '20 / page' },
	{ value: '50', label: '50 / page' },
	{ value: '100', label: '100 / page' },
];

interface UseVariantListViewOptions {
	variants: Variant[];
	products: Product[];
	isAllScope: boolean;
}

const normalizeProductName = (name: Product['name']) => {
	return localizedTextToString(name);
};

const normalizeVariantName = (name: Variant['name']) => {
	return localizedTextToString(name);
};

function buildProductNameById(products: Product[]) {
	return products.reduce<Record<string, string>>((accumulator, product) => {
		accumulator[product.id] = normalizeProductName(product.name);
		return accumulator;
	}, {});
}

function buildProductOptions(products: Product[]) {
	return products
		.map((product) => ({
			value: product.id,
			label: `${normalizeProductName(product.name)} (${product.sku})`,
		}))
		.sort((left, right) => left.label.localeCompare(right.label));
}

function filterVariants(
	variants: Variant[],
	searchValue: string,
	statusFilters: string[],
	productFilters: string[],
	productNameById: Record<string, string>,
	isAllScope: boolean,
) {
	const keyword = searchValue.trim().toLowerCase();

	return variants.filter((variant) => {
		const matchSearch = keyword.length === 0
			|| normalizeVariantName(variant.name).toLowerCase().includes(keyword)
			|| variant.sku.toLowerCase().includes(keyword)
			|| (variant.barcode ?? '').toLowerCase().includes(keyword)
			|| (
				isAllScope
				&& (productNameById[variant.productId] ?? variant.productId).toLowerCase().includes(keyword)
			);
		const matchStatus = statusFilters.length === 0 || statusFilters.includes(variant.status);
		const matchProduct = !isAllScope
			|| productFilters.length === 0
			|| productFilters.includes(variant.productId);

		return matchSearch && matchStatus && matchProduct;
	});
}

function usePagination<T>(items: T[]) {
	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(20);

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
		const parsed = Number(value ?? 20);
		setPageSize(Number.isNaN(parsed) ? 20 : parsed);
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

function buildActionBarFilters(
	statusFilters: string[],
	onStatusFilterChange: (value: string[]) => void,
	productFilters: string[],
	onProductFilterChange: (value: string[]) => void,
	productOptions: Array<{ value: string; label: string }>,
	isAllScope: boolean,
): ActionBarFilterConfig[] {
	const baseFilters: ActionBarFilterConfig[] = [{
		value: statusFilters,
		onChange: onStatusFilterChange,
		options: STATUS_OPTIONS,
		placeholder: 'Status',
		maxValues: 2,
	}];

	if (!isAllScope) {
		return baseFilters;
	}

	return [
		...baseFilters,
		{
			value: productFilters,
			onChange: onProductFilterChange,
			options: productOptions,
			placeholder: 'Product',
			maxValues: 10,
			minWidth: 240,
		},
	];
}


type VariantListScope = 'product' | 'all';

interface UseVariantListHandlersOptions {
	scope?: VariantListScope;
}

export function useVariantListView({
	variants,
	products,
	isAllScope,
}: UseVariantListViewOptions) {
	const [searchValue, setSearchValue] = React.useState('');
	const [statusFilters, setStatusFilters] = React.useState<string[]>([]);
	const [productFilters, setProductFilters] = React.useState<string[]>([]);

	const productNameById = React.useMemo(() => {
		return buildProductNameById(products);
	}, [products]);

	const productOptions = React.useMemo(() => {
		return buildProductOptions(products);
	}, [products]);

	const filters = React.useMemo<ActionBarFilterConfig[]>(() => {
		return buildActionBarFilters(
			statusFilters,
			setStatusFilters,
			productFilters,
			setProductFilters,
			productOptions,
			isAllScope,
		);
	}, [isAllScope, productFilters, productOptions, statusFilters]);

	const filteredVariants = React.useMemo(() => {
		return filterVariants(
			variants,
			searchValue,
			statusFilters,
			productFilters,
			productNameById,
			isAllScope,
		);
	}, [isAllScope, productFilters, productNameById, searchValue, statusFilters, variants]);

	const sortedVariants = React.useMemo(() => {
		return [...filteredVariants].sort((left, right) => {
			const byName = normalizeVariantName(left.name).localeCompare(normalizeVariantName(right.name));
			if (byName !== 0) {
				return byName;
			}
			return left.sku.localeCompare(right.sku);
		});
	}, [filteredVariants]);

	const {
		page,
		setPage,
		pageSize,
		totalPages,
		pagedItems,
		handlePageSizeChange,
	} = usePagination(sortedVariants);

	React.useEffect(() => {
		setPage(1);
	}, [pageSize, productFilters, searchValue, setPage, statusFilters]);

	const hasActiveFilters = searchValue.trim().length > 0
		|| statusFilters.length > 0
		|| (isAllScope && productFilters.length > 0);

	const emptyMessage = hasActiveFilters
		? 'No variants match current filters'
		: (isAllScope ? 'No variants found across all products' : 'No variants found');

	return {
		searchValue,
		setSearchValue,
		filters,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		pagedVariants: pagedItems,
		pagedCount: pagedItems.length,
		filteredCount: sortedVariants.length,
		productNameById,
		emptyMessage,
	};
}

export function useVariantListHandlers(options: UseVariantListHandlersOptions = {}) {
	const { scope = 'product' } = options;
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const { productId } = useParams();
	const activeOrg = useActiveOrgWithDetails();

	const isAllScope = scope === 'all';
	const orgId = activeOrg?.id ?? 'org-1';

	const handleCreate = React.useCallback(() => {
		if (isAllScope) {
			navigate('../products', { relative: 'path' });
			return;
		}
		navigate('create');
	}, [isAllScope, navigate]);

	const refreshVariants = React.useCallback(() => {
		if (isAllScope) {
			dispatch(variantActions.listAllVariants(orgId));
			return;
		}

		if (productId) {
			dispatch(variantActions.listVariants({ orgId, productId }));
		}
	}, [dispatch, isAllScope, productId, orgId]);

	const refreshProducts = React.useCallback(() => {
		if (isAllScope) {
			dispatch(productActions.listProducts({ orgId: orgId ?? 'org-1' }));
		}
	}, [dispatch, isAllScope, orgId]);

	const handleRefresh = React.useCallback(() => {
		refreshVariants();
		refreshProducts();
	}, [refreshProducts, refreshVariants]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return {
		handleCreate,
		handleRefresh,
	};
}
