import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, eventActions, selectEventDetail } from '@/appState';


export function useEventDetail(eventId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectEventDetail);

	React.useEffect(() => {
		if (eventId) {
			dispatch(eventActions.getEvent(eventId));
		}
	}, [eventId, dispatch]);

	return {
		event: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}

