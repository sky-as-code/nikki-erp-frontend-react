import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskSettingActions, selectKioskSettingDetail } from '@/appState';


export function useKioskSettingDetail(settingId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectKioskSettingDetail);

	React.useEffect(() => {
		if (settingId) {
			dispatch(kioskSettingActions.getKioskSetting(settingId));
		}
	}, [settingId, dispatch]);

	return {
		setting: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}

