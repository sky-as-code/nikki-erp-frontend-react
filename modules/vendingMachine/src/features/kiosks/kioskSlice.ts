import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { SearchGraph } from '@/components/FilterGroup';

import { kioskService } from './kioskService';

import type {
	Kiosk,
	CreateKioskBody,
	UpdateKioskBody,
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	PagedSearchResponse,
} from './types';


export const SLICE_NAME = 'vendingMachine.kiosk';

export const DEFAULT_PAGE_SIZE = 10;

export type ListPagination = { total: number; page: number; size: number };

export type KioskState = {
	detail: ReduxActionState<Kiosk>;
	list: ReduxActionState<Kiosk[]>;
	listPagination: ListPagination;
	create: ReduxActionState<RestCreateResponse>;
	update: ReduxActionState<RestUpdateResponse>;
	delete: ReduxActionState<RestDeleteResponse>;
};

export const initialKioskState: KioskState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	listPagination: { total: 0, page: 0, size: DEFAULT_PAGE_SIZE },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export type ListKiosksParams = {
	page?: number;
	size?: number;
	graph?: SearchGraph;
};

export const listKiosks = createAsyncThunk<
	PagedSearchResponse<Kiosk>,
	ListKiosksParams | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKiosks`,
	async (params, { rejectWithValue }) => {
		try {
			return await kioskService.searchKiosks({
				page: params?.page ?? 0,
				size: params?.size ?? DEFAULT_PAGE_SIZE,
				graph: JSON.stringify(params?.graph ?? {}),
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
			return await kioskService.getKiosk(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKiosk = createAsyncThunk<
	RestCreateResponse,
	CreateKioskBody,
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
	{ id: string; body: UpdateKioskBody },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKiosk`,
	async ({ id, body }, { rejectWithValue }) => {
		try {
			return await kioskService.updateKiosk(id, body);
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
	},
	extraReducers: (builder) => {
		listKiosksReducers(builder);
		getKioskReducers(builder);
		createKioskReducers(builder);
		updateKioskReducers(builder);
		deleteKioskReducers(builder);
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
		.addCase(getKiosk.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
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
		.addCase(createKiosk.pending, (state) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createKiosk.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createKiosk.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk';
		});
}

function updateKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(updateKiosk.pending, (state) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateKiosk.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			if (state.detail.data?.id === action.payload.id && state.detail.data) {
				state.detail.data = { ...state.detail.data, etag: action.payload.etag };
			}
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((k) => k.id === action.payload.id);
				if (listIndex >= 0) {
					const row = state.list.data[listIndex];
					state.list.data[listIndex] = {
						...row,
						etag: action.payload.etag,
						updatedAt: String(action.payload.updatedAt),
					};
				}
			}
		})
		.addCase(updateKiosk.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk';
		});
}

function deleteKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(deleteKiosk.pending, (state) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteKiosk.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.data = action.payload;
			if (state.list.data) {
				state.list.data = state.list.data.filter((k) => k.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteKiosk.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk';
		});
}


export const actions = {
	...kioskSlice.actions,
};

export const { reducer } = kioskSlice;
