import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { IdentityDispatch, hierarchyActions } from '../../../appState';
import { useOrgScopeRef } from '../../../hooks';


export function useHierarchyListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const scopeRef = useOrgScopeRef();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(hierarchyActions.listHierarchies({ scopeRef }));
	}, [dispatch, scopeRef]);

	React.useEffect(() => {
		dispatch(hierarchyActions.listHierarchies({ scopeRef }));
	}, [dispatch, scopeRef]);

	return {
		handleCreate,
		handleRefresh,
	};
}
