import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { unitActions, unitCategoryActions } from '../../../appState';
import { selectCreateUnit, selectUnitList } from '../../../appState/unit';
import { selectUnitCategoryList } from '../../../appState/unitCategory';
import type { Unit } from '../types';

import type { InventoryDispatch } from '../../../appState';
import type { UnitCategory } from '../../unitCategory/types';
import { StringToJson } from '../../../utils/serializer';


export type UnitFormValues = {
	name: Record<string, string>;
	symbol?: string;
	categoryId?: string;
};

export function useUnitCreateHandlers() {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const listUnit = useMicroAppSelector(selectUnitList);
	const createCommand = useMicroAppSelector(selectCreateUnit);

	const unitCategories = (listUnitCategory.data ?? []) as UnitCategory[];
	const units = (listUnit.data ?? []) as Unit[];
	const isSubmitting = createCommand.status === 'pending';

	React.useEffect(() => {
		dispatch(unitActions.listUnits(orgId));
		dispatch(unitCategoryActions.listUnitCategories(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(t('nikki.inventory.unit.messages.createSuccess'), '');
			dispatch(unitActions.resetCreateUnit());
			dispatch(unitActions.listUnits(orgId));
			navigate('..', { relative: 'path' });
		}

		if (createCommand.status === 'error') {
			notification.showError(
				createCommand.error instanceof Error ? createCommand.error.message : t('nikki.inventory.unit.messages.createError'),
				'',
			);
			dispatch(unitActions.resetCreateUnit());
		}
	}, [createCommand.status, dispatch, navigate, notification, orgId]);

	const handleCreate = (dataValue: any) => {
		console.log('Creating unit with data:', dataValue);
		dataValue.name = StringToJson(dataValue.name);
		dispatch(unitActions.createUnit({
			orgId,
			data: {
				orgId,
				name: StringToJson(dataValue.name),
				symbol: dataValue.symbol ? (dataValue.symbol as string) : undefined,
				categoryId: dataValue.categoryId ? (dataValue.categoryId as string) : undefined,
			},
		}));
	};

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	return {
		unitCategories,
		units,
		isSubmitting,
		onSubmit: handleCreate,
		handleGoBack,
	};
}