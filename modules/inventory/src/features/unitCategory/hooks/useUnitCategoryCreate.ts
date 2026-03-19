import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitCategoryActions } from '../../../appState';
import { selectCreateUnitCategory } from '../../../appState/unitCategory';

import type { InventoryDispatch } from '../../../appState';


export type UnitCategoryCreateFormValues = {
	name: Record<string, string>;
};

export const UNIT_CATEGORY_DEFAULT_VALUES: UnitCategoryCreateFormValues = {
	name: { en: '', vi: '' },
};

export function useUnitCategoryCreateHandlers() {
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const navigate = useNavigate();
	const { notification } = useUIState();
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';
	const createCommand = useMicroAppSelector(selectCreateUnitCategory);

	const isSubmitting = createCommand.status === 'pending';

	const handleGoBack = React.useCallback(() => {
		navigate('..', { relative: 'path' });
	}, [navigate]);

	const handleCreate = React.useCallback(async (values: Record<string, unknown>) => {
		try {
			await dispatch(unitCategoryActions.createUnitCategory({
				orgId,
				data: {
					name: values.name as Record<string, string>,
				},
			})).unwrap();
			notification.showInfo('Category created successfully', '');
			dispatch(unitCategoryActions.resetCreateUnitCategory());
			dispatch(unitCategoryActions.listUnitCategories(orgId));
			handleGoBack();
		}
		catch (error) {
			notification.showError(
				error instanceof Error ? error.message : 'Failed to create category',
				'',
			);
			dispatch(unitCategoryActions.resetCreateUnitCategory());
		}
	}, [dispatch, handleGoBack, notification, orgId]);

	return {
		isSubmitting,
		onSubmit: handleCreate,
		handleGoBack,
	};
}