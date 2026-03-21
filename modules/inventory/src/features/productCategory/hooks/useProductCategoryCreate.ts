import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { productCategoryActions } from '../../../appState';
import { selectCreateProductCategory } from '../../../appState/productCategory';
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';


export type ProductCategoryCreateFormValues = {
	name: string;
};

export const PRODUCT_CATEGORY_DEFAULT_VALUES: ProductCategoryCreateFormValues = {
	name: '',
};

export function useProductCategoryCreateHandlers() {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';
	const createCommand = useMicroAppSelector(selectCreateProductCategory);

	const isLoading = createCommand.status === 'pending';

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleCreate = React.useCallback(async (values: ProductCategoryCreateFormValues) => {
		const name = toLocalizedText(values.name);
		if (!name) {
			return;
		}
		try {
			await dispatch(productCategoryActions.createProductCategory({
				orgId,
				data: {
					orgId,
					name,
				},
			})).unwrap();
			notification.showInfo('Category created successfully', '');
			dispatch(productCategoryActions.resetCreateProductCategory());
			dispatch(productCategoryActions.listProductCategories(orgId));
			handleGoBack();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to create category',
				'',
			);
			dispatch(productCategoryActions.resetCreateProductCategory());
		}
	}, [dispatch, handleGoBack, notification, orgId]);

	return {
		isLoading,
		onSubmit: handleCreate,
		handleGoBack,
	};
}