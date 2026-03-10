import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, themeActions, selectThemeDetail } from '@/appState';


export function useThemeDetail(themeId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectThemeDetail);

	React.useEffect(() => {
		if (themeId) {
			dispatch(themeActions.getTheme(themeId));
		}
	}, [themeId, dispatch]);

	return {
		theme: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
