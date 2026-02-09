import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { IdentityDispatch, userActions } from '../../../appState';
import { useOrgScopeRef } from '../../../hooks';


export function useUserListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const scopeRef = useOrgScopeRef();

	const handleCreate = () => {
		navigate('create');
	};

	const handleRefresh = () => {
		dispatch(userActions.listUsers({ scopeRef }));
	};
	React.useEffect(() => {
		dispatch(userActions.listUsers({ scopeRef }));
	}, [dispatch, scopeRef]);

	return {
		handleCreate,
		handleRefresh,
	};
}