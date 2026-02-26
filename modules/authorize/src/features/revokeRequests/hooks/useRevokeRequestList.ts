import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	AuthorizeDispatch,
	revokeRequestActions,
	selectRevokeRequestState,
} from '@/appState';


export function useRevokeRequestList() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { revokeRequests, isLoadingList } = useMicroAppSelector(selectRevokeRequestState);

	React.useEffect(() => {
		dispatch(revokeRequestActions.listRevokeRequests());
	}, []);

	const handleRefresh = React.useCallback(() => {
		dispatch(revokeRequestActions.listRevokeRequests());
	}, []);

	return {
		revokeRequests,
		isLoadingList,
		handleRefresh,
	};
}
