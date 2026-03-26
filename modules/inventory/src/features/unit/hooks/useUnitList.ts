import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { selectUnitList, unitActions } from '../../../appState/unit';
import { unitCategoryActions } from '../../../appState/unitCategory';

import type { InventoryDispatch } from '../../../appState';

export function useUnitListHandlers() {
	const navigate = useNavigate();
	const dispatch = useMicroAppDispatch() as InventoryDispatch;
	const activeOrg = useActiveOrgWithDetails();
	const orgId = activeOrg?.id ?? 'org-1';
	const listUnit = useMicroAppSelector(selectUnitList);

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
		listUnit,
	};
}
