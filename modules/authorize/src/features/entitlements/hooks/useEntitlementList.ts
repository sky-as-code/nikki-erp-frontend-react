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
	selectResourceState,
} from '@/appState';


function useEntitlementListData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { entitlements, isLoadingList } = useMicroAppSelector(selectEntitlementState);
	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);

	React.useEffect(() => {
		dispatch(entitlementActions.listEntitlements());
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
		if (actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [dispatch, resources.length, actions.length]);

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

