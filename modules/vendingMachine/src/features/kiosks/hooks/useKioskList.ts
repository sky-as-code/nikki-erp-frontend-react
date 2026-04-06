import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useEffect } from 'react';

import { VendingMachineDispatch, kioskActions, selectKioskList } from '@/appState';


export function useKioskList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskList);

	useEffect(() => {
		if (list.status === 'idle') {
			dispatch(kioskActions.listKiosks());
		}
	}, [dispatch, list]);

	return {
		kiosks: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
	};
}

