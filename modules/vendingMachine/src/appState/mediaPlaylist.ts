import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listMediaPlaylists,
	getMediaPlaylist,
	createMediaPlaylist,
	updateMediaPlaylist,
	deleteMediaPlaylist,
	setPlaylistArchived,
	MediaPlaylistState,
	initialMediaPlaylistState,
} from '@/features/mediaPlaylist/mediaPlaylistSlice';


const STATE_KEY = 'mediaPlaylist';

export const mediaPlaylistReducer = {
	[STATE_KEY]: reducer,
};

export const mediaPlaylistActions = {
	listMediaPlaylists,
	getMediaPlaylist,
	createMediaPlaylist,
	updateMediaPlaylist,
	deleteMediaPlaylist,
	setPlaylistArchived,
	...actions,
};

export const selectMediaPlaylistState = (state: { [STATE_KEY]?: MediaPlaylistState }) =>
	state?.[STATE_KEY] ?? initialMediaPlaylistState;

export const selectMediaPlaylistList = createSelector(
	selectMediaPlaylistState,
	(state) => state.list,
);

export const selectMediaPlaylistListPagination = createSelector(
	selectMediaPlaylistState,
	(state) => state.listPagination,
);

export const selectMediaPlaylistDetail = createSelector(
	selectMediaPlaylistState,
	(state) => state.detail,
);

export const selectCreateMediaPlaylist = createSelector(
	selectMediaPlaylistState,
	(state) => state.create,
);

export const selectUpdateMediaPlaylist = createSelector(
	selectMediaPlaylistState,
	(state) => state.update,
);

export const selectDeleteMediaPlaylist = createSelector(
	selectMediaPlaylistState,
	(state) => state.delete,
);

export const selectSetArchivedPlaylist = createSelector(
	selectMediaPlaylistState,
	(state) => state.archive,
);
