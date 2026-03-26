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

export function useProductCategoryCreateHandlers() {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';
	const createCommand = useMicroAppSelector(selectCreateProductCategory);

	const isLoading = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo('Category created successfully', '');
			dispatch(productCategoryActions.resetCreateProductCategory());
			dispatch(productCategoryActions.listProductCategories(orgId));
			navigate('..', { relative: 'path' });
		}
		if (createCommand.status === 'error') {
			notification.showError('Failed to create category', '');
			dispatch(productCategoryActions.resetCreateProductCategory());
		}
	}, [createCommand.status, dispatch, navigate, notification, orgId]);

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleCreate = React.useCallback((values: ProductCategoryCreateFormValues) => {
		const name = toLocalizedText(values.name);
		if (!name) {
			return;
		}
		dispatch(productCategoryActions.createProductCategory({
			orgId,
			data: {
				orgId,
				name,
			},
		}));
	}, [dispatch, orgId]);

	return {
		isLoading,
		onSubmit: handleCreate,
		handleGoBack,
	};
}