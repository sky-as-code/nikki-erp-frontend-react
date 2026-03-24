import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, gameActions, selectGameList } from '@/appState';


export function useGameList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectGameList);

	React.useEffect(() => {
		if (list.status === 'idle') {
			dispatch(gameActions.listGames());
		}
	}, [dispatch, list]);


	const handleRefresh = () => dispatch(gameActions.listGames());

	return {
		games: list.data,
		isLoadingList: list.status === 'pending' || list.status === 'idle',
		handleRefresh,
	};
}
