
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { IdentityDispatch, groupActions } from '../../../appState';


export function useGroupListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const activeOrg = useActiveOrgWithDetails();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = () => {
		if (activeOrg) {
			dispatch(groupActions.listGroups(activeOrg.id));
		}
	};

	React.useEffect(() => {
		if (activeOrg) {
			dispatch(groupActions.listGroups(activeOrg.id));
		}
	}, [dispatch, activeOrg]);

	return {
		handleCreate,
		handleRefresh,
	};
}