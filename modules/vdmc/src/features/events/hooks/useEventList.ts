import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, eventActions, selectEventList } from '@/appState';


export function useEventList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectEventList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(eventActions.listEvents());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(eventActions.listEvents());

	return {
		events: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}

