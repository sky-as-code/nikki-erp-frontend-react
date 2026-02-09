import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	entitlementActions,
	selectEntitlementState,
} from '@/appState';


function useEntitlementListData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { entitlements, isLoadingList } = useMicroAppSelector(selectEntitlementState);

	React.useEffect(() => {
		dispatch(entitlementActions.listEntitlements());
	}, []);

	return { entitlements, isLoadingList };
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

