import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { productCategoryActions } from '../../../appState';
import {
	selectDeleteProductCategory,
	selectProductCategoryList,
	selectUpdateProductCategory,
} from '../../../appState/productCategory';
import { localizedTextToString, toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';
import type { ProductCategory } from '../types';


export type ProductCategoryDetailFormValues = {
	name: string;
};

const EMPTY_FORM_VALUES: ProductCategoryDetailFormValues = {
	name: '',
};

function toFormValues(category: ProductCategory): ProductCategoryDetailFormValues {
	return {
		name: localizedTextToString(category.name),
	};
}

interface UseProductCategoryDetailOptions {
	categoryId?: string;
}

export function useProductCategoryDetail({ categoryId }: UseProductCategoryDetailOptions = {}) {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const listProductCategory = useMicroAppSelector(selectProductCategoryList);
	const updateCommand = useMicroAppSelector(selectUpdateProductCategory);
	const deleteCommand = useMicroAppSelector(selectDeleteProductCategory);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const categories = (listProductCategory.data ?? []) as ProductCategory[];
	const category = React.useMemo(() => {
		return categories.find((item) => item.id === categoryId) ?? null;
	}, [categories, categoryId]);

	const loadData = React.useCallback(() => {
		dispatch(productCategoryActions.listProductCategories(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		loadData();
	}, [loadData]);

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleSave = React.useCallback(async (values: ProductCategoryDetailFormValues) => {
		if (!categoryId || !category) {
			return;
		}

		const name = toLocalizedText(values.name);
		if (!name) {
			return;
		}

		try {
			await dispatch(productCategoryActions.updateProductCategory({
				id: categoryId,
				etag: category.etag,
				name,
			})).unwrap();
			notification.showInfo('Category updated successfully', '');
			dispatch(productCategoryActions.resetUpdateProductCategory());
			loadData();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to update category',
				'',
			);
			dispatch(productCategoryActions.resetUpdateProductCategory());
		}
	}, [category, categoryId, dispatch, loadData, notification]);

	const handleDelete = React.useCallback(async () => {
		if (!categoryId) {
			return;
		}

		try {
			await dispatch(productCategoryActions.deleteProductCategory(categoryId)).unwrap();
			notification.showInfo('Category deleted successfully', '');
			dispatch(productCategoryActions.resetDeleteProductCategory());
			handleGoBack();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to delete category',
				'',
			);
			dispatch(productCategoryActions.resetDeleteProductCategory());
		}
	}, [categoryId, dispatch, handleGoBack, notification]);

	const isLoading = listProductCategory.status === 'pending';
	const isSubmitting = updateCommand.status === 'pending' || deleteCommand.status === 'pending';

	const modelValue = React.useMemo(() => {
		if (!category) {
			return EMPTY_FORM_VALUES;
		}
		return toFormValues(category);
	}, [category]);

	return {
		isLoading,
		isSubmitting,
		category,
		modelValue,
		handleGoBack,
		onSave: handleSave,
		onDelete: handleDelete,
	};
}