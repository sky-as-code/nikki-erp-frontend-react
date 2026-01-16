import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { AuthorizeDispatch, resourceActions, selectResourceList } from '@/appState';


export function useResourceList() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const list2 = useMicroAppSelector(selectResourceList);

	React.useEffect(() => {
		if (list2.status === 'idle') {
			dispatch(resourceActions.listResources());
		}
	}, [dispatch, list2]);


	const handleRefresh = () => dispatch(resourceActions.listResources());

	return {
		resources: list2.data,
		isLoadingList: list2.status === 'pending' || list2.status === 'idle',
		handleRefresh,
	};
}
