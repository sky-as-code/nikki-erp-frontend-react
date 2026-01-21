import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { IdentityDispatch, userActions } from '../../../appState';


export function useUserListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const activeOrg = useActiveOrgWithDetails();

	const handleCreate = () => {
		navigate('create');
	};

	const handleRefresh = () => {
		if (activeOrg?.id) {
			dispatch(userActions.listUsers(activeOrg.id));
		}
	};
	React.useEffect(() => {
		if (activeOrg?.id) {
			dispatch(userActions.listUsers(activeOrg.id));
		}
	}, [dispatch, activeOrg]);

	return {
		handleCreate,
		handleRefresh,
	};
}