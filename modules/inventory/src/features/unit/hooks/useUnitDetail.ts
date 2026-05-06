import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

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
import { StringToJson } from '../../../utils/serializer';


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

export function useUnitDetail() {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const { unitId } = useParams();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const listUnits = useMicroAppSelector(selectUnitList);
	const updateCommand = useMicroAppSelector(selectUpdateUnit);
	const deleteCommand = useMicroAppSelector(selectDeleteUnit);

	const unitCategories = (listUnitCategory.data ?? []) as UnitCategory[];
	const units = (listUnits.data ?? []) as Unit[];
	const unit = units.find((u) => u.id === unitId);

	React.useEffect(() => {
		dispatch(unitActions.listUnits(orgId));
		dispatch(unitCategoryActions.listUnitCategories(orgId));
	}, [dispatch, orgId, unitId]);

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.unit.messages.updateSuccess'), '');
			dispatch(unitActions.resetUpdateUnit());
			navigate('..', { relative: 'path' });
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				updateCommand.error instanceof Error ? updateCommand.error.message : t('nikki.inventory.unit.messages.updateError'),
				'',
			);
			dispatch(unitActions.resetUpdateUnit());
		}
	}, [updateCommand.status, dispatch, navigate, notification]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.unit.messages.deleteSuccess'), '');
			dispatch(unitActions.resetDeleteUnit());
			navigate('..', { relative: 'path' });
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				deleteCommand.error instanceof Error ? deleteCommand.error.message : t('nikki.inventory.unit.messages.deleteError'),
				'',
			);
			dispatch(unitActions.resetDeleteUnit());
		}
	}, [deleteCommand.status, dispatch, navigate, notification]);

	const handleGoBack = () => {
		navigate('..', { relative: 'path' });
	};

	const handleSave = (data: any) => {
		console.log('Saving unit with data:', data);
		dispatch(unitActions.updateUnit({
			orgId,
			data: {
				...data,
				id: unitId,
				etag: unit?.etag,
				name: StringToJson(data.name),
			},
		}));
	};

	const handleDelete = () => {
		dispatch(unitActions.deleteUnit({ orgId, id: unitId || '' }));
	};

	const isLoading
		= listUnitCategory.status === 'pending'
		|| listUnits.status === 'pending';
	const isSubmitting = updateCommand.status === 'pending' || deleteCommand.status === 'pending';

	const categoryOptions = unitCategories;

	return {
		isLoading,
		isSubmitting,
		unit,
		categoryOptions,
		units,
		handleGoBack,
		onSave: handleSave,
		onDelete: handleDelete,
	};
}