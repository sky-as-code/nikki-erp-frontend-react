import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { productCategoryActions } from '../../../appState';
import {
	selectCreateProductCategory,
	selectUpdateProductCategory,
	selectDeleteProductCategory,
	selectProductCategoryList,
} from '../../../appState/productCategory';
import { toLocalizedText } from '../../localizedText';

import type { InventoryDispatch } from '../../../appState';
import type { ProductCategory } from '../types';
import { JsonToString } from '../../../utils/serializer';

interface UseSearchProductCategoriesOptions {
	categories: ProductCategory[];
}

export function useSearchProductCategories({
	categories,
}: UseSearchProductCategoriesOptions) {
	const [searchValue, setSearchValue] = React.useState('');

	const searchCategories = React.useMemo(() => {
		const keyword = searchValue.trim().toLowerCase();

		if (keyword.length === 0) {
			return categories;
		}

		return categories.filter((category) => {
			return JsonToString(category.name).toLowerCase().includes(keyword);
		});
	}, [searchValue, categories]);

	return {
		searchValue,
		setSearchValue,
		searchCategories,
	};
}


export type ProductCategoryFormPayload = {
	name: string;
};

export function useProductCategoryListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const listProductCategory = useMicroAppSelector(selectProductCategoryList);
	const orgId = activeOrg?.id ?? 'org-1';

	const createCommand = useMicroAppSelector(selectCreateProductCategory);
	const updateCommand = useMicroAppSelector(selectUpdateProductCategory);
	const deleteCommand = useMicroAppSelector(selectDeleteProductCategory);

	const isLoading = listProductCategory.status === 'pending';

	const refreshList = React.useCallback(() => {
		dispatch(productCategoryActions.listProductCategories(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			refreshList();
			dispatch(productCategoryActions.resetCreateProductCategory());
		}
	}, [createCommand.status, dispatch, refreshList]);

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			refreshList();
			dispatch(productCategoryActions.resetUpdateProductCategory());
		}
	}, [updateCommand.status, dispatch, refreshList]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			refreshList();
			dispatch(productCategoryActions.resetDeleteProductCategory());
		}
	}, [deleteCommand.status, dispatch, refreshList]);

	const handleOpenCreatePage = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		refreshList();
	}, [refreshList]);

	const handleCreate = React.useCallback((payload: ProductCategoryFormPayload) => {
		const name = toLocalizedText(payload.name);
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

	const handleUpdate = React.useCallback((
		id: string,
		etag: string,
		payload: ProductCategoryFormPayload,
	) => {
		const name = toLocalizedText(payload.name);
		if (!name) {
			return;
		}
		dispatch(productCategoryActions.updateProductCategory({
			orgId,
			data: {
				id,
				etag,
				name,
			},
		}));
	}, [dispatch, orgId]);

	const handleDelete = React.useCallback((id: string) => {
		dispatch(productCategoryActions.deleteProductCategory({
			orgId,
			id,
		}));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		refreshList();
	}, [refreshList]);

	return {
		categories: (listProductCategory.data ?? []) as ProductCategory[],
		isLoading,
		orgId,
		handleOpenCreatePage,
		handleRefresh,
		handleCreate,
		handleUpdate,
		handleDelete,
	};
}
