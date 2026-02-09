import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitCategoryActions } from '../../../appState';
import {
	selectDeleteUnitCategory,
	selectUnitCategoryList,
	selectUpdateUnitCategory,
} from '../../../appState/unitCategory';

import type { InventoryDispatch } from '../../../appState';
import type { UnitCategory } from '../types';


export type UnitCategoryDetailFormValues = {
	name: string;
};

const EMPTY_FORM_VALUES: UnitCategoryDetailFormValues = {
	name: '',
};

function toFormValues(category: UnitCategory): UnitCategoryDetailFormValues {
	return {
		name: category.name,
	};
}

interface UseUnitCategoryDetailOptions {
	categoryId?: string;
}

export function useUnitCategoryDetail({ categoryId }: UseUnitCategoryDetailOptions = {}) {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const updateCommand = useMicroAppSelector(selectUpdateUnitCategory);
	const deleteCommand = useMicroAppSelector(selectDeleteUnitCategory);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const categories = (listUnitCategory.data ?? []) as UnitCategory[];
	const category = React.useMemo(() => {
		return categories.find((item) => item.id === categoryId) ?? null;
	}, [categories, categoryId]);

	const loadData = React.useCallback(() => {
		dispatch(unitCategoryActions.listUnitCategories(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		loadData();
	}, [loadData]);

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleSave = React.useCallback(async (values: UnitCategoryDetailFormValues) => {
		if (!categoryId || !category) {
			return;
		}

		try {
			await dispatch(unitCategoryActions.updateUnitCategory({
				id: categoryId,
				etag: category.etag,
				name: values.name,
			})).unwrap();
			notification.showInfo('Category updated successfully', '');
			dispatch(unitCategoryActions.resetUpdateUnitCategory());
			loadData();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to update category',
				'',
			);
			dispatch(unitCategoryActions.resetUpdateUnitCategory());
		}
	}, [category, categoryId, dispatch, loadData, notification]);

	const handleDelete = React.useCallback(async () => {
		if (!categoryId) {
			return;
		}

		try {
			await dispatch(unitCategoryActions.deleteUnitCategory(categoryId)).unwrap();
			notification.showInfo('Category deleted successfully', '');
			dispatch(unitCategoryActions.resetDeleteUnitCategory());
			handleGoBack();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to delete category',
				'',
			);
			dispatch(unitCategoryActions.resetDeleteUnitCategory());
		}
	}, [categoryId, dispatch, handleGoBack, notification]);

	const isLoading = listUnitCategory.status === 'pending';
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