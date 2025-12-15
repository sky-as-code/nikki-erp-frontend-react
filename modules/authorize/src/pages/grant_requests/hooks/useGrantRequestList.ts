import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { AuthorizeDispatch, grantRequestActions, selectGrantRequestState } from '@/appState';


export function useGrantRequestList() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { items, isLoadingList } = useMicroAppSelector(selectGrantRequestState);

	React.useEffect(() => {
		if (!isLoadingList && items.length === 0) {
			dispatch(grantRequestActions.listGrantRequests());
		}
	}, [dispatch, isLoadingList, items.length]);

	return { items, isLoading: isLoadingList };
}

