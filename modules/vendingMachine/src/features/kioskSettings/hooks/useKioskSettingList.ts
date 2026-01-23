import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskSettingActions, selectKioskSettingList } from '@/appState';


export function useKioskSettingList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskSettingList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(kioskSettingActions.listKioskSettings());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(kioskSettingActions.listKioskSettings());

	return {
		settings: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}

