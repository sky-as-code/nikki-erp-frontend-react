import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { unitActions } from '../../../appState/unit';
import { unitCategoryActions } from '../../../appState/unitCategory';

import type { InventoryDispatch } from '../../../appState';


export const PAGE_SIZE_OPTIONS = [
	{ value: '5', label: '5 / page' },
	{ value: '10', label: '10 / page' },
	{ value: '20', label: '20 / page' },
	{ value: '50', label: '50 / page' },
];

export function useUnitListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(unitActions.listUnits(orgId));
		dispatch(unitCategoryActions.listUnitCategories(orgId));
	}, [dispatch, orgId]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return {
		handleCreate,
		handleRefresh,
	};
}
