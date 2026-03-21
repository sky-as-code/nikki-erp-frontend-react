import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitActions, unitCategoryActions } from '../../../appState';
import {
	selectDeleteUnit,
	selectUnitDetail,
	selectUpdateUnit,
	selectUnitList,
} from '../../../appState/unit';
import { selectUnitCategoryList } from '../../../appState/unitCategory';

import type { InventoryDispatch } from '../../../appState';
import type { Unit } from '../types';
import type { UnitCategory } from '../../unitCategory/types';


export type UnitDetailFormValues = {
	name: Record<string, string>;
	symbol?: string;
	categoryId?: string;
	baseUnit?: string;
	multiplier?: number;
};

const EMPTY_FORM_VALUES: UnitDetailFormValues = {
	name: { en: '', vi: '' },
	symbol: '',
	categoryId: '',
	baseUnit: '',
	multiplier: undefined,
};

function toFormValues(unit: Unit): UnitDetailFormValues {
	return {
		name: unit.name,
		symbol: unit.symbol || '',
		categoryId: unit.categoryId || '',
		baseUnit: unit.baseUnit || '',
		multiplier: unit.multiplier,
	};
}

interface UseUnitDetailOptions {
	unitId?: string;
}

export function useUnitDetail({ unitId }: UseUnitDetailOptions = {}) {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const unitDetail = useMicroAppSelector(selectUnitDetail);
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const listUnits = useMicroAppSelector(selectUnitList);
	const updateCommand = useMicroAppSelector(selectUpdateUnit);
	const deleteCommand = useMicroAppSelector(selectDeleteUnit);
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const navigate = useNavigate();
	const { notification } = useUIState();
	const unit = unitDetail.data;
	const unitCategories = (listUnitCategory.data ?? []) as UnitCategory[];
	const units = (listUnits.data ?? []) as Unit[];

	const loadData = React.useCallback(() => {
		if (!unitId) {
			return;
		}

		dispatch(unitActions.getUnit({ orgId, id: unitId }));
		dispatch(unitActions.listUnits(orgId));
		dispatch(unitCategoryActions.listUnitCategories(orgId));
	}, [dispatch, orgId, unitId]);

	React.useEffect(() => {
		loadData();
	}, [loadData]);

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleSave = React.useCallback(async (values: UnitDetailFormValues) => {
		if (!unitId || !unit) {
			return;
		}

		try {
			await dispatch(unitActions.updateUnit({
				orgId,
				data: {
					id: unitId,
					etag: unit.etag,
					name: values.name,
					symbol: values.symbol,
					categoryId: values.categoryId,
					baseUnit: values.baseUnit ? (values.baseUnit as string) : undefined,
					multiplier: values.multiplier ? (values.multiplier as number) : undefined,
				},
			})).unwrap();
			notification.showInfo('Unit updated successfully', '');
			dispatch(unitActions.resetUpdateUnit());
			handleGoBack();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to update unit',
				'',
			);
			dispatch(unitActions.resetUpdateUnit());
		}
	}, [dispatch, handleGoBack, notification, unit, unitId, orgId]);

	const handleDelete = React.useCallback(async () => {
		if (!unitId) {
			return;
		}

		try {
			await dispatch(unitActions.deleteUnit({ orgId, id: unitId })).unwrap();
			notification.showInfo('Unit deleted successfully', '');
			dispatch(unitActions.resetDeleteUnit());
			handleGoBack();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to delete unit',
				'',
			);
			dispatch(unitActions.resetDeleteUnit());
		}
	}, [dispatch, handleGoBack, notification, unitId, orgId]);

	const isLoading = unitDetail.status === 'pending' || listUnitCategory.status === 'pending' || listUnits.status === 'pending';
	const isSubmitting = updateCommand.status === 'pending' || deleteCommand.status === 'pending';

	const categoryOptions = React.useMemo(() => {
		return unitCategories;
	}, [unitCategories]);

	const modelValue = React.useMemo(() => {
		if (!unit) {
			return EMPTY_FORM_VALUES;
		}

		return toFormValues(unit);
	}, [unit]);

	return {
		isLoading,
		isSubmitting,
		unit,
		categoryOptions,
		units,
		modelValue,
		handleGoBack,
		onSave: handleSave,
		onDelete: handleDelete,
	};
}