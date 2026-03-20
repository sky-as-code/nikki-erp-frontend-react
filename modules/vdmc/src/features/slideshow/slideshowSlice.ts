import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { slideshowService } from './slideshowService';
import { Slideshow } from './types';



export const SLICE_NAME = 'vendingMachine.slideshow';

export type SlideshowState = {
	detail: ReduxActionState<Slideshow>;
	list: ReduxActionState<Slideshow[]>;
	create: ReduxActionState<Slideshow>;
	update: ReduxActionState<Slideshow>;
	delete: ReduxActionState<void>;
};

export const initialSlideshowState: SlideshowState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listSlideshows = createAsyncThunk<
	Slideshow[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listSlideshows`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await slideshowService.listSlideshows();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list slideshows';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getSlideshow = createAsyncThunk<
	Slideshow | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getSlideshow`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await slideshowService.getSlideshow(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get slideshow';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createSlideshow = createAsyncThunk<
	Slideshow,
	Omit<Slideshow, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createSlideshow`,
	async (slideshow, { rejectWithValue }) => {
		try {
			const result = await slideshowService.createSlideshow(slideshow);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create slideshow';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateSlideshow = createAsyncThunk<
	Slideshow,
	{ id: string; etag: string; updates: Partial<Omit<Slideshow, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateSlideshow`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await slideshowService.updateSlideshow(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update slideshow';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteSlideshow = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteSlideshow`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await slideshowService.deleteSlideshow(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete slideshow';
			return rejectWithValue(errorMessage);
		}
	},
);

const slideshowSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialSlideshowState,
	reducers: {
		setSlideshows: (state, action: PayloadAction<Slideshow[]>) => {
			state.list.data = action.payload;
		},
		resetCreateSlideshow: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateSlideshow: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteSlideshow: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listSlideshowsReducers(builder);
		getSlideshowReducers(builder);
		createSlideshowReducers(builder);
		updateSlideshowReducers(builder);
		deleteSlideshowReducers(builder);
	},
});

function listSlideshowsReducers(builder: ActionReducerMapBuilder<SlideshowState>) {
	builder
		.addCase(listSlideshows.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listSlideshows.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listSlideshows.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list slideshows';
			state.list.data = [];
		});
}

function getSlideshowReducers(builder: ActionReducerMapBuilder<SlideshowState>) {
	builder
		.addCase(getSlideshow.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getSlideshow.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getSlideshow.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get slideshow';
			state.detail.data = undefined;
		});
}

function createSlideshowReducers(builder: ActionReducerMapBuilder<SlideshowState>) {
	builder
		.addCase(createSlideshow.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createSlideshow.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createSlideshow.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create slideshow';
		});
}

function updateSlideshowReducers(builder: ActionReducerMapBuilder<SlideshowState>) {
	builder
		.addCase(updateSlideshow.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateSlideshow.fulfilled, (state, action) => {
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
		.addCase(updateSlideshow.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update slideshow';
		});
}

function deleteSlideshowReducers(builder: ActionReducerMapBuilder<SlideshowState>) {
	builder
		.addCase(deleteSlideshow.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteSlideshow.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((a) => a.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteSlideshow.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete slideshow';
		});
}


export const actions = {
	...slideshowSlice.actions,
};

export const { reducer } = slideshowSlice;
