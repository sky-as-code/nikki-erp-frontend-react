import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitCategoryActions } from '../../../appState';
import {
	selectDeleteUnitCategory,
	selectUnitCategoryDetail,
	selectUpdateUnitCategory,
} from '../../../appState/unitCategory';

import type { InventoryDispatch } from '../../../appState';
import type { UnitCategory } from '../types';


export type UnitCategoryDetailFormValues = {
	name: Record<string, string>;
};

const EMPTY_FORM_VALUES: UnitCategoryDetailFormValues = {
	name: { en: '', vi: '' },
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
	const categoryDetail = useMicroAppSelector(selectUnitCategoryDetail);
	const updateCommand = useMicroAppSelector(selectUpdateUnitCategory);
	const deleteCommand = useMicroAppSelector(selectDeleteUnitCategory);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const category = categoryDetail.data;

	const loadData = React.useCallback(() => {
		if (!categoryId) {
			return;
		}

		dispatch(unitCategoryActions.getUnitCategory({ orgId, id: categoryId }));
	}, [categoryId, dispatch, orgId]);

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
				orgId,
				data: {
					id: categoryId,
					etag: category.etag,
					name: values.name,
				},
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
	}, [category, categoryId, dispatch, loadData, notification, orgId]);

	const handleDelete = React.useCallback(async () => {
		if (!categoryId) {
			return;
		}

		try {
			await dispatch(unitCategoryActions.deleteUnitCategory({
				orgId,
				id: categoryId,
			})).unwrap();
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
	}, [categoryId, dispatch, handleGoBack, notification, orgId]);

	const isLoading = categoryDetail.status === 'pending';

	return {
		isLoading,
		category,
		handleGoBack,
		onSave: handleSave,
		onDelete: handleDelete,
	};
}