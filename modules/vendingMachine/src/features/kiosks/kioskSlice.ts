import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { KioskCreatePayload, KioskUpdatePayload } from './hooks';
import { kioskService } from './kioskService';
import { Kiosk, KioskLog } from './types';

import type {
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	RestArchiveResponse,
	PagedSearchResponse,
	SearchParams,
	Pagination,
} from '@/types';


export const SLICE_NAME = 'vendingMachine.kiosk';

export const KIOSK_DEFAULT_PAGE_SIZE = 10;


export type KioskState = {
	detail: ReduxActionState<Kiosk>;
	list: ReduxActionState<Kiosk[]>;
	listPagination: Pagination;
	create: ReduxActionState<RestCreateResponse>;
	update: ReduxActionState<RestUpdateResponse>;
	delete: ReduxActionState<RestDeleteResponse>;
	archive: ReduxActionState<RestArchiveResponse>;
	kioskLogs: ReduxActionState<KioskLog[]>;
	kioskLogsPagination: Pagination;
};

export const initialKioskState: KioskState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	listPagination: { total: 0, page: 0, size: KIOSK_DEFAULT_PAGE_SIZE },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	archive: baseReduxActionState,
	kioskLogs: { ...baseReduxActionState, data: [] },
	kioskLogsPagination: { total: 0, page: 0, size: KIOSK_DEFAULT_PAGE_SIZE },
};


export const listKiosks = createAsyncThunk<
	PagedSearchResponse<Kiosk>,
	SearchParams<Kiosk> | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKiosks`,
	async (params, { rejectWithValue }) => {
		try {
			return await kioskService.searchKiosks({
				columns: [
					'id',
					'etag',
					'code',
					'name',
					'isArchived',
					'mode',
					'uiMode',
					'locationAddress',
					'latitude',
					'longitude',
					'lastPing',
					'connections',
					'createdAt',
					'updatedAt',
				],
				...(params || {}),
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosks';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKiosk = createAsyncThunk<
	Kiosk,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKiosk`,
	async (id, { rejectWithValue }) => {
		try {
			return await kioskService.getKiosk(id, [
				'id',
				'etag',
				'code',
				'name',
				'isArchived',
				'mode',
				'uiMode',
				'locationAddress',
				'latitude',
				'longitude',
				'lastPing',
				'connections',
				'modelRef',
				'model',
				'settingRef',
				'setting',
				'payments',
				// 'events',
				// 'themeRef',
				// 'theme',
				// 'gameRef',
				// 'game',
				// 'shoppingScreenPlaylistRef',
				// 'shoppingScreenPlaylist',
				// 'waitingScreenPlaylistRef',
				// 'waitingScreenPlaylist',
				// 'scopeType',
				'createdAt',
				'updatedAt',
			]);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKiosk = createAsyncThunk<
	RestCreateResponse,
	KioskCreatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKiosk`,
	async (body, { rejectWithValue }) => {
		try {
			return await kioskService.createKiosk(body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKiosk = createAsyncThunk<
	RestUpdateResponse,
	KioskUpdatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKiosk`,
	async ({ id, body }, { rejectWithValue }) => {
		try {
			return await kioskService.updateKiosk({ id, body });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKiosk = createAsyncThunk<
	RestDeleteResponse,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKiosk`,
	async ({ id }, { rejectWithValue }) => {
		try {
			return await kioskService.deleteKiosk(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const setArchivedKiosk = createAsyncThunk<
	RestArchiveResponse,
	{ id: string; etag: string; isArchived: boolean },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/setArchivedKiosk`,
	async ({ id, etag, isArchived }, { rejectWithValue }) => {
		try {
			return await kioskService.setArchivedKiosk(id, { etag, isArchived });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to set archived kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskState,
	reducers: {
		setKiosks: (state, action: PayloadAction<Kiosk[]>) => {
			state.list.data = action.payload;
		},
		resetCreateKiosk: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKiosk: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKiosk: (state) => {
			state.delete = baseReduxActionState;
		},
		resetSetArchivedKiosk: (state) => {
			state.archive = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKiosksReducers(builder);
		getKioskReducers(builder);
		createKioskReducers(builder);
		updateKioskReducers(builder);
		deleteKioskReducers(builder);
		setArchivedKioskReducers(builder);
		searchKioskLogsReducers(builder);
	},
});

function listKiosksReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(listKiosks.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKiosks.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
			state.listPagination = {
				total: action.payload.total,
				page: action.payload.page,
				size: action.payload.size,
			};
		})
		.addCase(listKiosks.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosks';
			state.list.data = [];
		});
}

function getKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(getKiosk.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getKiosk.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getKiosk.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk';
			state.detail.data = undefined;
		});
}

function createKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(createKiosk.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createKiosk.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createKiosk.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk';
			state.create.requestId = action.meta.requestId;
		});
}

function updateKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(updateKiosk.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateKiosk.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateKiosk.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk';
			state.update.requestId = action.meta.requestId;
		});
}

function deleteKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(deleteKiosk.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteKiosk.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.data = action.payload;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteKiosk.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk';
			state.delete.requestId = action.meta.requestId;
		});
}

function setArchivedKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(setArchivedKiosk.pending, (state, action) => {
			state.archive.status = 'pending';
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedKiosk.fulfilled, (state, action) => {
			state.archive.status = 'success';
			state.archive.data = action.payload;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedKiosk.rejected, (state, action) => {
			state.archive.status = 'error';
			state.archive.error = action.payload || 'Failed to set archived kiosk';
			state.archive.requestId = action.meta.requestId;
		});
}

export const searchKioskLogs = createAsyncThunk<
	PagedSearchResponse<KioskLog>,
	SearchParams<KioskLog> | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/searchKioskLogs`,
	async (params, { rejectWithValue }) => {
		try {
			return await kioskService.searchKioskLogs({...(params || {})});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to search kiosk logs';
			return rejectWithValue(errorMessage);
		}
	},
);

function searchKioskLogsReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(searchKioskLogs.pending, (state) => {
			state.kioskLogs.status = 'pending';
			state.kioskLogs.error = null;
		})
		.addCase(searchKioskLogs.fulfilled, (state, action) => {
			state.kioskLogs.status = 'success';
			state.kioskLogs.data = action.payload.items;
			state.kioskLogs.error = null;
			state.kioskLogsPagination = {
				total: action.payload.total,
				page: action.payload.page,
				size: action.payload.size,
			};
		})
		.addCase(searchKioskLogs.rejected, (state, action) => {
			state.kioskLogs.status = 'error';
			state.kioskLogs.error = action.payload || 'Failed to search kiosk logs';
			state.kioskLogs.data = [];
		});
}

export const actions = {
	...kioskSlice.actions,
};

export const { reducer } = kioskSlice;
