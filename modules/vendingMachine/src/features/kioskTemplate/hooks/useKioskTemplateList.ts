import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskTemplateActions, selectKioskTemplateList } from '@/appState';


export function useKioskTemplateList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskTemplateList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(kioskTemplateActions.listKioskTemplates());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(kioskTemplateActions.listKioskTemplates());

	return {
		templates: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}

