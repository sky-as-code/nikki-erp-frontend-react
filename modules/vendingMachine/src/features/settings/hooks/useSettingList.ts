import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, settingActions, selectSettingList } from '@/appState';

export function useSettingList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectSettingList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(settingActions.listSettings());
		}
	}, [dispatch, list]);

	const handleRefresh = () => dispatch(settingActions.listSettings());

	return {
		settings: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
