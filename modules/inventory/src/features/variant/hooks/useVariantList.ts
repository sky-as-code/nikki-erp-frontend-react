import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';
import { selectVariantList, variantActions } from '../../../appState/variant';

import type { InventoryDispatch } from '../../../appState';
import type { Variant } from '../types';
import { JsonToString } from '../../../utils/serializer';

interface UseSearchVariantsOptions {
	variants: Variant[];
}
export function useSearchVariants({
	variants,
}: UseSearchVariantsOptions) {
	const [searchValue, setSearchValue] = React.useState('');

	const searchVariants = React.useMemo(() => {
		const keyword = searchValue.trim().toLowerCase();

		if (keyword.length === 0) {
			return variants;
		}

		return variants.filter((variant) => {
			return JsonToString(variant.name).toLowerCase().includes(keyword)
				|| variant.sku.toLowerCase().includes(keyword)
				|| (variant.barcode ?? '').toLowerCase().includes(keyword);
		});
	}, [searchValue, variants]);

	return {
		searchValue,
		setSearchValue,
		searchVariants,
	};
}

export function useVariantListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const listVariant = useMicroAppSelector(selectVariantList);

	const orgId = activeOrg?.id ?? 'org-1';
	const isLoading = listVariant.status === 'pending';

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const refreshVariants = React.useCallback(() => {
		dispatch(variantActions.listAllVariants(orgId));
	}, [dispatch, orgId]);

	const handleRefresh = React.useCallback(() => {
		refreshVariants();
	}, [refreshVariants]);

	React.useEffect(() => {
		refreshVariants();
	}, [refreshVariants]);

	return {
		variants : (listVariant.data ?? []) as Variant[],
		handleCreate,
		handleRefresh,
		isLoading
	};
}
