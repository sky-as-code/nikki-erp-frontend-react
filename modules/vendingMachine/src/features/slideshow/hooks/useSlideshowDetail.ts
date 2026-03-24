import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { VendingMachineDispatch, slideshowActions, selectSlideshowDetail } from '@/appState';

export function useSlideshowDetail(slideshowId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectSlideshowDetail);
	React.useEffect(() => {
		if (slideshowId) {
			dispatch(slideshowActions.getSlideshow(slideshowId));
		}
	}, [slideshowId, dispatch]);
	return {
		slideshow: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
