import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';


import { KioskModelCreatePayload } from './hooks/useKioskModelCreate';
import { KioskModelUpdatePayload } from './hooks/useKioskModelEdit';
import { kioskModelService } from './kioskModelService';
import { KioskModel } from './types';

import type {
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	PagedSearchResponse,
	SearchParams,
	Pagination,
	RestArchiveResponse,
} from '@/types';


export const SLICE_NAME = 'vendingMachine.kioskModel';

export const DEFAULT_PAGE_SIZE = 10;


export type KioskModelState = {
	detail: ReduxActionState<KioskModel>;
	list: ReduxActionState<KioskModel[]>;
	listPagination: Pagination;
	create: ReduxActionState<RestCreateResponse>;
	update: ReduxActionState<RestUpdateResponse>;
	delete: ReduxActionState<RestDeleteResponse>;
	archive: ReduxActionState<RestArchiveResponse>;
};

export const initialKioskModelState: KioskModelState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	listPagination: { total: 0, page: 0, size: DEFAULT_PAGE_SIZE },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	archive: baseReduxActionState,
};


export const listKioskModels = createAsyncThunk<
	PagedSearchResponse<KioskModel>,
	SearchParams<KioskModel> | undefined,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKioskModels`,
	async (params, { rejectWithValue }) => {
		try {
			return await kioskModelService.searchKioskModels({...(params || {})});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosk models';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKioskModel = createAsyncThunk<
	KioskModel,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKioskModel`,
	async (id, { rejectWithValue }) => {
		try {
			return await kioskModelService.getKioskModel(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKioskModel = createAsyncThunk<
	RestCreateResponse,
	KioskModelCreatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKioskModel`,
	async (body, { rejectWithValue }) => {
		try {
			return await kioskModelService.createKioskModel(body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKioskModel = createAsyncThunk<
	RestUpdateResponse,
	KioskModelUpdatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskModel`,
	async ({ id, body }, { rejectWithValue }) => {
		try {
			return await kioskModelService.updateKioskModel({ id, body });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKioskModel = createAsyncThunk<
	RestDeleteResponse,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKioskModel`,
	async ({ id }, { rejectWithValue }) => {
		try {
			return await kioskModelService.deleteKioskModel(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);


export const setArchivedKioskModel = createAsyncThunk<
	RestArchiveResponse,
	{ id: string, etag: string, isArchived: boolean },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/setArchivedKioskModel`,
	async ({ id, etag, isArchived }, { rejectWithValue }) => {
		try {
			return await kioskModelService.setArchivedKioskModel(id, { etag, isArchived });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to set archived kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskModelSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskModelState,
	reducers: {
		setKioskModels: (state, action: PayloadAction<KioskModel[]>) => {
			state.list.data = action.payload;
		},
		resetCreateKioskModel: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKioskModel: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKioskModel: (state) => {
			state.delete = baseReduxActionState;
		},
		resetSetArchivedKioskModel: (state) => {
			state.archive = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKioskModelsReducers(builder);
		getKioskModelReducers(builder);
		createKioskModelReducers(builder);
		updateKioskModelReducers(builder);
		deleteKioskModelReducers(builder);
		setArchivedKioskModelReducers(builder);
	},
});

function listKioskModelsReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(listKioskModels.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKioskModels.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload.items;
			state.list.error = null;
			state.listPagination = {
				total: action.payload.total,
				page: action.payload.page,
				size: action.payload.size,
			};
		})
		.addCase(listKioskModels.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosk models';
			state.list.data = [];
		});
}

function getKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(getKioskModel.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getKioskModel.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getKioskModel.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk model';
			state.detail.data = undefined;
		});
}

function createKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(createKioskModel.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createKioskModel.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createKioskModel.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk model';
			state.create.requestId = action.meta.requestId;
		});
}

function updateKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(updateKioskModel.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateKioskModel.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateKioskModel.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk model';
			state.update.requestId = action.meta.requestId;
		});
}

function deleteKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(deleteKioskModel.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteKioskModel.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.data = action.payload;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteKioskModel.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk model';
			state.delete.requestId = action.meta.requestId;
		});
}

function setArchivedKioskModelReducers(builder: ActionReducerMapBuilder<KioskModelState>) {
	builder
		.addCase(setArchivedKioskModel.pending, (state, action) => {
			state.archive.status = 'pending';
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedKioskModel.fulfilled, (state, action) => {
			state.archive.status = 'success';
			state.archive.data = action.payload;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedKioskModel.rejected, (state, action) => {
			state.archive.status = 'error';
			state.archive.error = action.payload || 'Failed to set archived kiosk model';
			state.archive.requestId = action.meta.requestId;
		});
}

export const actions = {
	...kioskModelSlice.actions,
};

export const { reducer } = kioskModelSlice;
