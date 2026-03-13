import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, gameActions, selectGameDetail } from '@/appState';


export function useGameDetail(gameId: string | undefined) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectGameDetail);

	React.useEffect(() => {
		if (gameId && detail.data?.id !== gameId) {
			dispatch(gameActions.getGame(gameId));
		}
	}, [dispatch, gameId, detail.data?.id]);

	return {
		game: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
