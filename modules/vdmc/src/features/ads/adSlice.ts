import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { adService } from './adService';
import { Ad } from './types';



export const SLICE_NAME = 'vendingMachine.ad';

export type AdState = {
	detail: ReduxActionState<Ad>;
	list: ReduxActionState<Ad[]>;
	create: ReduxActionState<Ad>;
	update: ReduxActionState<Ad>;
	delete: ReduxActionState<void>;
};

export const initialAdState: AdState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listAds = createAsyncThunk<
	Ad[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listAds`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await adService.listAds();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list ads';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getAd = createAsyncThunk<
	Ad | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getAd`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await adService.getAd(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get ad';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createAd = createAsyncThunk<
	Ad,
	Omit<Ad, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createAd`,
	async (ad, { rejectWithValue }) => {
		try {
			const result = await adService.createAd(ad);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create ad';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateAd = createAsyncThunk<
	Ad,
	{ id: string; etag: string; updates: Partial<Omit<Ad, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateAd`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await adService.updateAd(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update ad';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteAd = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteAd`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await adService.deleteAd(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete ad';
			return rejectWithValue(errorMessage);
		}
	},
);

const adSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialAdState,
	reducers: {
		setAds: (state, action: PayloadAction<Ad[]>) => {
			state.list.data = action.payload;
		},
		resetCreateAd: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateAd: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteAd: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listAdsReducers(builder);
		getAdReducers(builder);
		createAdReducers(builder);
		updateAdReducers(builder);
		deleteAdReducers(builder);
	},
});

function listAdsReducers(builder: ActionReducerMapBuilder<AdState>) {
	builder
		.addCase(listAds.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listAds.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listAds.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list ads';
			state.list.data = [];
		});
}

function getAdReducers(builder: ActionReducerMapBuilder<AdState>) {
	builder
		.addCase(getAd.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getAd.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getAd.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get ad';
			state.detail.data = undefined;
		});
}

function createAdReducers(builder: ActionReducerMapBuilder<AdState>) {
	builder
		.addCase(createAd.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createAd.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createAd.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create ad';
		});
}

function updateAdReducers(builder: ActionReducerMapBuilder<AdState>) {
	builder
		.addCase(updateAd.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateAd.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((a) => a.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateAd.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update ad';
		});
}

function deleteAdReducers(builder: ActionReducerMapBuilder<AdState>) {
	builder
		.addCase(deleteAd.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteAd.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((a) => a.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteAd.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete ad';
		});
}


export const actions = {
	...adSlice.actions,
};

export const { reducer } = adSlice;

