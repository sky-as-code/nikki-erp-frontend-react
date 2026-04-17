import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { mediaPlaylistService } from './mediaPlaylistService';

import type { Playlist, ResourceScopeType } from './types';
import type { PagedSearchResponse, Pagination, RestArchiveResponse, SearchParams } from '@/types';


export const SLICE_NAME = 'vendingMachine.mediaPlaylist';

export const MEDIA_PLAYLIST_DEFAULT_PAGE_SIZE = 10;

export type MediaPlaylistState = {
	detail: ReduxActionState<Playlist>;
	list: ReduxActionState<Playlist[]>;
	listPagination: Pagination;
	create: ReduxActionState<Playlist>;
	update: ReduxActionState<Playlist>;
	delete: ReduxActionState<void>;
	archive: ReduxActionState<RestArchiveResponse>;
};

export const initialMediaPlaylistState: MediaPlaylistState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	listPagination: { total: 0, page: 0, size: MEDIA_PLAYLIST_DEFAULT_PAGE_SIZE },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	archive: baseReduxActionState,
};

export const listMediaPlaylists = createAsyncThunk<
	PagedSearchResponse<Playlist>,
	SearchParams<Playlist> | undefined,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listMediaPlaylists`,
	async (params, { rejectWithValue }) => {
		try {
			return await mediaPlaylistService.searchMediaPlaylists(params);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list media playlists';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getMediaPlaylist = createAsyncThunk<
	Playlist | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getMediaPlaylist`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await mediaPlaylistService.getMediaPlaylist(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get media playlist';
			return rejectWithValue(errorMessage);
		}
	},
);

export type CreateMediaPlaylistPayload = {
	name: string;
	scopeType?: ResourceScopeType;
	scopeRef?: string | null;
};

export const createMediaPlaylist = createAsyncThunk<
	Playlist,
	CreateMediaPlaylistPayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createMediaPlaylist`,
	async (playlist, { rejectWithValue }) => {
		try {
			const result = await mediaPlaylistService.createMediaPlaylist(playlist);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create media playlist';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateMediaPlaylist = createAsyncThunk<
	Playlist,
	{ id: string; etag: string; updates: Partial<Pick<Playlist, 'name' | 'scopeType' | 'scopeRef'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateMediaPlaylist`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await mediaPlaylistService.updateMediaPlaylist(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update media playlist';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteMediaPlaylist = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteMediaPlaylist`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await mediaPlaylistService.deleteMediaPlaylist(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete media playlist';
			return rejectWithValue(errorMessage);
		}
	},
);

export const setPlaylistArchived = createAsyncThunk<
	RestArchiveResponse,
	{ id: string; etag: string; isArchived: boolean },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/setPlaylistArchived`,
	async ({ id, etag, isArchived }, { rejectWithValue }) => {
		try {
			return await mediaPlaylistService.setPlaylistArchived(id, { etag, isArchived });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to set archived playlist';
			return rejectWithValue(errorMessage);
		}
	},
);

const mediaPlaylistSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialMediaPlaylistState,
	reducers: {
		setMediaPlaylists: (state, action: PayloadAction<Playlist[]>) => {
			state.list.data = action.payload;
		},
		resetCreateMediaPlaylist: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateMediaPlaylist: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteMediaPlaylist: (state) => {
			state.delete = baseReduxActionState;
		},
		resetSetArchivedPlaylist: (state) => {
			state.archive = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listMediaPlaylistsReducers(builder);
		getMediaPlaylistReducers(builder);
		createMediaPlaylistReducers(builder);
		updateMediaPlaylistReducers(builder);
		deleteMediaPlaylistReducers(builder);
		setPlaylistArchivedReducers(builder);
	},
});

function listMediaPlaylistsReducers(builder: ActionReducerMapBuilder<MediaPlaylistState>) {
	builder
		.addCase(listMediaPlaylists.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listMediaPlaylists.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
			state.listPagination = {
				total: action.payload.total,
				page: action.payload.page,
				size: action.payload.size,
			};
		})
		.addCase(listMediaPlaylists.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list media playlists';
			state.list.data = [];
		});
}

function getMediaPlaylistReducers(builder: ActionReducerMapBuilder<MediaPlaylistState>) {
	builder
		.addCase(getMediaPlaylist.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getMediaPlaylist.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getMediaPlaylist.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get media playlist';
			state.detail.data = undefined;
		});
}

function createMediaPlaylistReducers(builder: ActionReducerMapBuilder<MediaPlaylistState>) {
	builder
		.addCase(createMediaPlaylist.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createMediaPlaylist.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createMediaPlaylist.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create media playlist';
		});
}

function updateMediaPlaylistReducers(builder: ActionReducerMapBuilder<MediaPlaylistState>) {
	builder
		.addCase(updateMediaPlaylist.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateMediaPlaylist.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateMediaPlaylist.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update media playlist';
			state.update.requestId = action.meta.requestId;
		});
}

function deleteMediaPlaylistReducers(builder: ActionReducerMapBuilder<MediaPlaylistState>) {
	builder
		.addCase(deleteMediaPlaylist.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteMediaPlaylist.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.requestId = action.meta.requestId;
			if (state.list.data) {
				state.list.data = state.list.data.filter((a) => a.id !== action.meta.arg.id);
			}
			state.listPagination.total = Math.max(0, state.listPagination.total - 1);
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteMediaPlaylist.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete media playlist';
			state.delete.requestId = action.meta.requestId;
		});
}

function setPlaylistArchivedReducers(builder: ActionReducerMapBuilder<MediaPlaylistState>) {
	builder
		.addCase(setPlaylistArchived.pending, (state, action) => {
			state.archive.status = 'pending';
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setPlaylistArchived.fulfilled, (state, action) => {
			state.archive.status = 'success';
			state.archive.data = action.payload;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setPlaylistArchived.rejected, (state, action) => {
			state.archive.status = 'error';
			state.archive.error = action.payload || 'Failed to set archived playlist';
			state.archive.requestId = action.meta.requestId;
		});
}

export const actions = {
	...mediaPlaylistSlice.actions,
};

export const { reducer } = mediaPlaylistSlice;
