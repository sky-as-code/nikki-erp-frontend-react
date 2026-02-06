
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { IdentityDispatch, groupActions } from '../../../appState';
import { useOrgScopeRef } from '../../../hooks';


export function useGroupListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const scopeRef = useOrgScopeRef();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = () => {
		dispatch(groupActions.listGroups({ scopeRef }));
	};

	React.useEffect(() => {
		dispatch(groupActions.listGroups({ scopeRef }));
	}, [dispatch, scopeRef]);

	return {
		handleCreate,
		handleRefresh,
	};
}