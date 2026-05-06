import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { productCategoryActions } from '../../../appState';
import {
	selectDeleteProductCategory,
	selectProductCategoryList,
	selectUpdateProductCategory,
} from '../../../appState/productCategory';
import { productActions, selectDeleteProduct, selectProductList } from '../../../appState/product';
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';
import type { ProductCategory } from '../types';
import type { Product } from '../../product/types';
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
	const listProduct = useMicroAppSelector(selectProductList);
	const updateCommand = useMicroAppSelector(selectUpdateProductCategory);
	const deleteCommand = useMicroAppSelector(selectDeleteProductCategory);
	const deleteProductCommand = useMicroAppSelector(selectDeleteProduct);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const categories = (listProductCategory.data ?? []) as ProductCategory[];
	const category = React.useMemo(() => {
		return categories.find((item) => item.id === categoryId) ?? null;
	}, [categories, categoryId]);

	const products = React.useMemo((): Product[] => {
		const allProducts = (listProduct.data ?? []) as Product[];
		if (!categoryId) return [];
		return allProducts.filter((p) => p.productCategoryIds?.includes(categoryId));
	}, [listProduct.data, categoryId]);

	const loadData = React.useCallback(() => {
		dispatch(productCategoryActions.listProductCategories(orgId));
		dispatch(productActions.listProducts({ orgId }));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		loadData();
	}, [loadData]);

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.productCategory.messages.updateSuccess'), '');
			dispatch(productCategoryActions.resetUpdateProductCategory());
			loadData();
		}
		if (updateCommand.status === 'error') {
			notification.showError(t('nikki.inventory.productCategory.messages.updateError'), '');
			dispatch(productCategoryActions.resetUpdateProductCategory());
		}
	}, [updateCommand.status, dispatch, loadData, notification]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.productCategory.messages.deleteSuccess'), '');
			dispatch(productCategoryActions.resetDeleteProductCategory());
			navigate('..', { relative: 'path' });
		}
		if (deleteCommand.status === 'error') {
			notification.showError(t('nikki.inventory.productCategory.messages.deleteError'), '');
			dispatch(productCategoryActions.resetDeleteProductCategory());
		}
	}, [deleteCommand.status, dispatch, navigate, notification]);

	React.useEffect(() => {
		if (deleteProductCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.product.messages.deleteSuccess'), '');
			dispatch(productActions.resetDeleteProduct());
			dispatch(productActions.listProducts({ orgId }));
		}
		if (deleteProductCommand.status === 'error') {
			notification.showError(t('nikki.inventory.product.messages.deleteError'), '');
			dispatch(productActions.resetDeleteProduct());
		}
	}, [deleteProductCommand.status, dispatch, notification, orgId, t]);

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

	const handleDeleteProduct = React.useCallback((productId: string) => {
		dispatch(productActions.deleteProduct({ orgId, id: productId }));
	}, [dispatch, orgId]);

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
		products,
		onDeleteProduct: handleDeleteProduct,
	};
}