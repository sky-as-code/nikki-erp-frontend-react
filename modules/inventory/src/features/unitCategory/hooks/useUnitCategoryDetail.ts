import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { unitCategoryActions } from '../../../appState';
import {
	selectDeleteUnitCategory,
	selectUnitCategoryList,
	selectUpdateUnitCategory,
} from '../../../appState/unitCategory';
import { unitActions, selectDeleteUnit, selectUnitList } from '../../../appState/unit';

import type { InventoryDispatch } from '../../../appState';
import type { UnitCategory } from '../types';
import type { Unit } from '../../unit/types';


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
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const listUnit = useMicroAppSelector(selectUnitList);
	const updateCommand = useMicroAppSelector(selectUpdateUnitCategory);
	const deleteCommand = useMicroAppSelector(selectDeleteUnitCategory);
	const deleteUnitCommand = useMicroAppSelector(selectDeleteUnit);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const categories = (listUnitCategory.data ?? []) as UnitCategory[];
	const category = React.useMemo(() => {
		return categories.find((item) => item.id === categoryId) ?? null;
	}, [categories, categoryId]);

	const units = React.useMemo((): Unit[] => {
		const allUnits = (listUnit.data ?? []) as Unit[];
		if (!categoryId) return [];
		return allUnits.filter((u) => u.categoryId === categoryId);
	}, [listUnit.data, categoryId]);

	const loadData = React.useCallback(() => {
		dispatch(unitCategoryActions.listUnitCategories(orgId));
		dispatch(unitActions.listUnits(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		loadData();
	}, [loadData]);

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.unitCategory.messages.updateSuccess'), '');
			dispatch(unitCategoryActions.resetUpdateUnitCategory());
			loadData();
		}
		if (updateCommand.status === 'error') {
			notification.showError(t('nikki.inventory.unitCategory.messages.updateError'), '');
			dispatch(unitCategoryActions.resetUpdateUnitCategory());
		}
	}, [updateCommand.status, dispatch, loadData, notification]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.unitCategory.messages.deleteSuccess'), '');
			dispatch(unitCategoryActions.resetDeleteUnitCategory());
			navigate('..', { relative: 'path' });
		}
		if (deleteCommand.status === 'error') {
			notification.showError(t('nikki.inventory.unitCategory.messages.deleteError'), '');
			dispatch(unitCategoryActions.resetDeleteUnitCategory());
		}
	}, [deleteCommand.status, dispatch, navigate, notification]);

	React.useEffect(() => {
		if (deleteUnitCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.unit.messages.deleteSuccess'), '');
			dispatch(unitActions.resetDeleteUnit());
			dispatch(unitActions.listUnits(orgId));
		}
		if (deleteUnitCommand.status === 'error') {
			notification.showError(t('nikki.inventory.unit.messages.deleteError'), '');
			dispatch(unitActions.resetDeleteUnit());
		}
	}, [deleteUnitCommand.status, dispatch, notification, orgId, t]);

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleSave = React.useCallback((values: UnitCategoryDetailFormValues) => {
		if (!categoryId || !category) {
			return;
		}

		dispatch(unitCategoryActions.updateUnitCategory({
			orgId,
			data: {
				id: categoryId,
				etag: category.etag,
				name: values.name,
			},
		}));
	}, [category, categoryId, dispatch, orgId]);

	const handleDelete = React.useCallback(() => {
		if (!categoryId) {
			return;
		}

		dispatch(unitCategoryActions.deleteUnitCategory({ orgId, id: categoryId }));
	}, [categoryId, dispatch, orgId]);

	const handleDeleteUnit = React.useCallback((unitId: string) => {
		dispatch(unitActions.deleteUnit({ orgId, id: unitId }));
	}, [dispatch, orgId]);

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
		units,
		onDeleteUnit: handleDeleteUnit,
	};
}
