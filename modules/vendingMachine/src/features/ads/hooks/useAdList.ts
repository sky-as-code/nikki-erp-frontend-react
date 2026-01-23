import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, adActions, selectAdList } from '@/appState';


export function useAdList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectAdList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(adActions.listAds());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(adActions.listAds());

	return {
		ads: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}

