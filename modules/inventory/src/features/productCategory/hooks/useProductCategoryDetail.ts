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
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';
import type { ProductCategory } from '../types';
import { JsonToString } from '../../../utils/serializer';


export type ProductCategoryDetailFormValues = {
	name: string;
};

const EMPTY_FORM_VALUES: ProductCategoryDetailFormValues = {
	name: '',
};

function toFormValues(category: ProductCategory): ProductCategoryDetailFormValues {
	return {
		name: JsonToString(category.name),
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

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo('Category updated successfully', '');
			dispatch(productCategoryActions.resetUpdateProductCategory());
			loadData();
		}
		if (updateCommand.status === 'error') {
			notification.showError('Failed to update category', '');
			dispatch(productCategoryActions.resetUpdateProductCategory());
		}
	}, [updateCommand.status, dispatch, loadData, notification]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo('Category deleted successfully', '');
			dispatch(productCategoryActions.resetDeleteProductCategory());
			navigate('..', { relative: 'path' });
		}
		if (deleteCommand.status === 'error') {
			notification.showError('Failed to delete category', '');
			dispatch(productCategoryActions.resetDeleteProductCategory());
		}
	}, [deleteCommand.status, dispatch, navigate, notification]);

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleSave = React.useCallback((values: ProductCategoryDetailFormValues) => {
		if (!categoryId || !category) {
			return;
		}

		const name = toLocalizedText(values.name);
		if (!name) {
			return;
		}

		dispatch(productCategoryActions.updateProductCategory({
			orgId,
			data: {
				id: categoryId,
				etag: category.etag,
				name,
			},
		}));
	}, [category, categoryId, dispatch, orgId]);

	const handleDelete = React.useCallback(() => {
		if (!categoryId) {
			return;
		}

		dispatch(productCategoryActions.deleteProductCategory({ orgId, id: categoryId }));
	}, [categoryId, dispatch, orgId]);

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