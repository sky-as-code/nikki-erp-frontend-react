import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, mediaPlaylistActions, selectMediaPlaylistDetail } from '@/appState';

export function useMediaPlaylistDetail(playlistId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectMediaPlaylistDetail);
	React.useEffect(() => {
		if (playlistId) {
			dispatch(mediaPlaylistActions.getMediaPlaylist(playlistId));
		}
	}, [playlistId, dispatch]);
	const isLoading = Boolean(playlistId) && (detail.status === 'pending' || detail.status === 'idle');
	return {
		playlist: detail.data,
		isLoading,
	};
}
