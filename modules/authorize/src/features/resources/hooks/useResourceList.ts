import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { AuthorizeDispatch, resourceActions, selectResourceList } from '@/appState';


export function useResourceList() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectResourceList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(resourceActions.listResources());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(resourceActions.listResources());

	return {
		resources: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
