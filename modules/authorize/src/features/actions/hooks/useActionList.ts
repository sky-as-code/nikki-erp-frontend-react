import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import type { Action } from '@/features/actions';

import {
	AuthorizeDispatch,
	actionActions,
	selectActionState,
} from '@/appState';


function useActionListData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { actions, isLoadingList } = useMicroAppSelector(selectActionState);

	React.useEffect(() => {
		dispatch(actionActions.listActions());
	}, []);

	return { actions, isLoadingList };
}

function useActionListHandlers(actions: Action[]) {
	const navigate = useNavigate();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();

	const handleViewDetail = React.useCallback((actionId: string) => {
		const action = actions.find((a: Action) => a.id === actionId);
		if (action) {
			navigate(`${action.id}`);
		}
	}, [navigate, actions]);

	const handleEdit = React.useCallback((actionId: string) => {
		const action = actions.find((a: Action) => a.id === actionId);
		if (action) {
			navigate(`${action.id}`);
		}
	}, [navigate, actions]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(actionActions.listActions(undefined));
	}, [dispatch]);

	return { handleViewDetail, handleEdit, handleCreate, handleRefresh };
}

export const useActionList = {
	data: useActionListData,
	handlers: useActionListHandlers,
};

