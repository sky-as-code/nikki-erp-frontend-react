import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, settingActions, selectSettingDetail } from '@/appState';

export function useSettingDetail(settingId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectSettingDetail);

	React.useEffect(() => {
		if (settingId) {
			dispatch(settingActions.getSetting(settingId));
		}
	}, [settingId, dispatch]);

	return {
		setting: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
