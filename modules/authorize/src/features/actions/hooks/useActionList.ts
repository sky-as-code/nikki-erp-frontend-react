import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	resourceActions,
	selectActionState,
	selectResourceState,
} from '@/appState';

import type { Action } from '@/features/actions';


function useActionListData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { actions, isLoadingList } = useMicroAppSelector(selectActionState);
	const { resources } = useMicroAppSelector(selectResourceState);

	React.useEffect(() => {
		dispatch(actionActions.listActions(undefined));
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
	}, [dispatch, resources.length]);

	return { actions, isLoadingList, resources };
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

