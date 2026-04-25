import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { IdentityDispatch, userActions } from '../../../appState';


export function useUserListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();

	const handleCreate = () => {
		navigate('create');
	};

	const handleRefresh = () => {
		dispatch(userActions.searchUsers({}));
	};
	React.useEffect(() => {
		dispatch(userActions.searchUsers({}));
	}, [dispatch]);

	return {
		handleCreate,
		handleRefresh,
	};
}