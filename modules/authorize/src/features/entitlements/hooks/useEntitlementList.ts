import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectEntitlementState,
	selectResourceList,
} from '@/appState';


function useEntitlementListData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { entitlements, isLoadingList } = useMicroAppSelector(selectEntitlementState);
	const resourceListState = useMicroAppSelector(selectResourceList);
	const actionState = useMicroAppSelector(selectActionState);
	const resources = resourceListState.data ?? [];
	const actions = actionState.actions ?? [];

	React.useEffect(() => {
		dispatch(entitlementActions.listEntitlements());
		if (resourceListState.status === 'idle' || (resourceListState.status === 'success' && resources.length === 0)) {
			dispatch(resourceActions.listResources());
		}
		if (!actionState.list.isLoading && actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [resourceListState.status, resources.length, actionState.list.isLoading, actions.length]);

	return { entitlements, isLoadingList, resources, actions };
}

function useEntitlementListHandlers() {
	const navigate = useNavigate();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();

	const handleViewDetail = React.useCallback((entitlementId: string) => {
		navigate(entitlementId);
	}, [navigate]);

	const handleEdit = React.useCallback((entitlementId: string) => {
		navigate(entitlementId);
	}, [navigate]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(entitlementActions.listEntitlements());
	}, [dispatch]);

	return { handleViewDetail, handleEdit, handleCreate, handleRefresh };
}

export const useEntitlementList = {
	data: useEntitlementListData,
	handlers: useEntitlementListHandlers,
};

