import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { attributeActions } from '../../../appState';
import type { InventoryDispatch } from '../../../appState';

import type { Attribute } from '../types';
import { JsonToString } from '../../../utils/serializer';

const normalizeAttributeName = (name: Attribute['displayName']) => {
	return JsonToString(name);
};

function filterAttributes(attributes: Attribute[], searchValue: string) {
	const keyword = searchValue.trim().toLowerCase();

	return attributes.filter((attribute) => {
		if (keyword.length === 0) {
			return true;
		}

		return normalizeAttributeName(attribute.displayName).toLowerCase().includes(keyword)
			|| attribute.codeName.toLowerCase().includes(keyword)
			|| String(attribute.dataType ?? '').toLowerCase().includes(keyword);
	});
}

function sortAttributes(attributes: Attribute[]) {
	return [...attributes].sort((left, right) => {
		const bySortIndex = (left.sortIndex || 0) - (right.sortIndex || 0);
		if (bySortIndex !== 0) {
			return bySortIndex;
		}

		const byName = normalizeAttributeName(left.displayName).localeCompare(
			normalizeAttributeName(right.displayName),
		);
		if (byName !== 0) {
			return byName;
		}

		return left.codeName.localeCompare(right.codeName);
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

export function useAttributeListView(attributes: Attribute[]) {
	const { t } = useTranslation();
	const [searchValue, setSearchValue] = React.useState('');

	const filteredAttributes = React.useMemo(() => {
		return sortAttributes(filterAttributes(attributes, searchValue));
	}, [attributes, searchValue]);

	const {
		page,
		setPage,
		pageSize,
		totalPages,
		pagedItems,
		handlePageSizeChange,
	} = usePagination(filteredAttributes);

	React.useEffect(() => {
		setPage(1);
	}, [pageSize, searchValue, setPage]);

	const hasActiveFilters = searchValue.trim().length > 0;
	const emptyMessage = hasActiveFilters
		? t('nikki.inventory.attribute.list.emptyFiltered')
		: t('nikki.inventory.attribute.list.empty');

	return {
		searchValue,
		setSearchValue,
		page,
		setPage,
		pageSize,
		totalPages,
		handlePageSizeChange,
		pagedAttributes: pagedItems,
		pagedCount: pagedItems.length,
		filteredCount: filteredAttributes.length,
		emptyMessage,
	};
}

interface UseAttributeListHandlersOptions {
	productId?: string;
}

export function useAttributeListHandlers(options: UseAttributeListHandlersOptions = {}) {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const { productId: productIdParam } = useParams();
	const productId = options.productId ?? productIdParam;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		if (productId) {
			dispatch(attributeActions.listAttributes({ orgId, productId }));
		}
	}, [dispatch, orgId, productId]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return {
		handleCreate,
		handleRefresh,
	};
}
