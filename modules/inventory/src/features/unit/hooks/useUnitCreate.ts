import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitActions, unitCategoryActions } from '../../../appState';
import { selectCreateUnit } from '../../../appState/unit';
import { selectUnitCategoryList } from '../../../appState/unitCategory';

import type { InventoryDispatch } from '../../../appState';
import type { UnitCategory } from '../../unitCategory/types';


export type UnitFormValues = {
	name: string;
	symbol: string;
	categoryId: string;
};

export const UNIT_DEFAULT_VALUES: UnitFormValues = {
	name: '',
	symbol: '',
	categoryId: '',
};

export function useUnitCreateHandlers() {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';
	const listUnitCategory = useMicroAppSelector(selectUnitCategoryList);
	const createCommand = useMicroAppSelector(selectCreateUnit);

	const unitCategories = (listUnitCategory.data ?? []) as UnitCategory[];
	const isSubmitting = createCommand.status === 'pending';

	React.useEffect(() => {
		dispatch(unitActions.listUnits());
		dispatch(unitCategoryActions.listUnitCategories(orgId));
	}, [dispatch, orgId]);

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleCreate = React.useCallback(async (values: UnitFormValues) => {
		try {
			await dispatch(unitActions.createUnit({
				name: values.name,
				symbol: values.symbol,
				categoryId: values.categoryId,
			})).unwrap();
			notification.showInfo('Unit created successfully', '');
			dispatch(unitActions.resetCreateUnit());
			dispatch(unitActions.listUnits());
			handleGoBack();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to create unit',
				'',
			);
			dispatch(unitActions.resetCreateUnit());
		}
	}, [dispatch, handleGoBack, notification]);

	return {
		unitCategories,
		isSubmitting,
		onSubmit: handleCreate,
		handleGoBack,
	};
}