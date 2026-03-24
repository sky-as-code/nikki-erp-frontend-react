import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { VendingMachineDispatch, slideshowActions, selectSlideshowList } from '@/appState';

export function useSlideshowList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectSlideshowList);
	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(slideshowActions.listSlideshows());
		}
	}, [dispatch, list]);
	const handleRefresh = () => dispatch(slideshowActions.listSlideshows());
	return {
		slideshows: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
