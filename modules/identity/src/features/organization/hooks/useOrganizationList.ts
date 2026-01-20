import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { IdentityDispatch, organizationActions } from '../../../appState';


export function useOrganizationListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(organizationActions.listOrganizations());
	}, [dispatch]);

	React.useEffect(() => {
		dispatch(organizationActions.listOrganizations());
	}, [dispatch]);

	return {
		handleCreate,
		handleRefresh,
	};
}
