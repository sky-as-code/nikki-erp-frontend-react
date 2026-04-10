import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { SearchGraph } from '@/components/FilterGroup';

import { kioskModelService } from './kioskModelService';

import type {
	KioskModel,
	CreateKioskModelBody,
	UpdateKioskModelBody,
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	PagedSearchResponse,
} from './types';


export const SLICE_NAME = 'vendingMachine.kioskModel';

export const DEFAULT_PAGE_SIZE = 10;

export type ListPagination = {
	total: number;
	page: number;
	size: number;
};

export type KioskModelState = {
	detail: ReduxActionState<KioskModel>;
	list: ReduxActionState<KioskModel[]>;
	listPagination: ListPagination;
	create: ReduxActionState<RestCreateResponse>;
	update: ReduxActionState<RestUpdateResponse>;
	delete: ReduxActionState<RestDeleteResponse>;
};

export const initialKioskModelState: KioskModelState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	listPagination: { total: 0, page: 0, size: DEFAULT_PAGE_SIZE },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export type ListKioskModelsParams = {
	page?: number;
	size?: number;
	graph?: SearchGraph;
};

export const listKioskModels = createAsyncThunk<
	PagedSearchResponse<KioskModel>,
	ListKioskModelsParams | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKioskModels`,
	async (params, { rejectWithValue }) => {
		try {
			return await kioskModelService.searchKioskModels({
				columns: [
					'createdAt',
					'etag',
					'modelId',
					'referenceCode',
					'name',
					'description',
					'shelvesNumber',
					'status',
					'kioskType',
					'shelvesConfig',
				],
				page: params?.page ?? 0,
				size: params?.size ?? DEFAULT_PAGE_SIZE,
				graph: JSON.stringify(params?.graph ?? {}),
			});
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
			const result = await kioskModelService.getKioskModel(id, [
				'createdAt',
				'etag',
				'modelId',
				'referenceCode',
				'name',
				'description',
				'shelvesNumber',
				'status',
				'kioskType',
				'shelvesConfig',
			]);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk model';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKioskModel = createAsyncThunk<
	RestCreateResponse,
	CreateKioskModelBody,
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
	{ id: string; body: UpdateKioskModelBody },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskModel`,
	async ({ id, body }, { rejectWithValue }) => {
		try {
			return await kioskModelService.updateKioskModel(id, body);
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
	},
	extraReducers: (builder) => {
		listKioskModelsReducers(builder);
		getKioskModelReducers(builder);
		createKioskModelReducers(builder);
		updateKioskModelReducers(builder);
		deleteKioskModelReducers(builder);
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
			// if (state.list.data) {
			// 	state.list.data = state.list.data.filter((m) => m.id !== action.meta.arg.id);
			// }
			// if (state.detail.data?.id === action.meta.arg.id) {
			// 	state.detail.data = undefined;
			// }
		})
		.addCase(deleteKioskModel.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk model';
			state.delete.requestId = action.meta.requestId;
		});
}


export const actions = {
	...kioskModelSlice.actions,
};

export const { reducer } = kioskModelSlice;
