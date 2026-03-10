import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, themeActions, selectThemeList } from '@/appState';


export function useThemeList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectThemeList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(themeActions.listThemes());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(themeActions.listThemes());

	return {
		themes: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
