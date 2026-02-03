import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { themeService } from './themeService';
import { Theme } from './types';



export const SLICE_NAME = 'vendingMachine.theme';

export type ThemeState = {
	detail: ReduxActionState<Theme>;
	list: ReduxActionState<Theme[]>;
	create: ReduxActionState<Theme>;
	update: ReduxActionState<Theme>;
	delete: ReduxActionState<void>;
};

export const initialThemeState: ThemeState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
};


export const listThemes = createAsyncThunk<
	Theme[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listThemes`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await themeService.listThemes();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list themes';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getTheme = createAsyncThunk<
	Theme | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getTheme`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await themeService.getTheme(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get theme';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createTheme = createAsyncThunk<
	Theme,
	Omit<Theme, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createTheme`,
	async (theme, { rejectWithValue }) => {
		try {
			const result = await themeService.createTheme(theme);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create theme';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateTheme = createAsyncThunk<
	Theme,
	{ id: string; etag: string; updates: Partial<Omit<Theme, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateTheme`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await themeService.updateTheme(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update theme';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteTheme = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteTheme`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await themeService.deleteTheme(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete theme';
			return rejectWithValue(errorMessage);
		}
	},
);

const themeSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialThemeState,
	reducers: {
		setThemes: (state, action: PayloadAction<Theme[]>) => {
			state.list.data = action.payload;
		},
		resetCreateTheme: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateTheme: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteTheme: (state) => {
			state.delete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listThemesReducers(builder);
		getThemeReducers(builder);
		createThemeReducers(builder);
		updateThemeReducers(builder);
		deleteThemeReducers(builder);
	},
});

function listThemesReducers(builder: ActionReducerMapBuilder<ThemeState>) {
	builder
		.addCase(listThemes.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listThemes.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listThemes.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list themes';
			state.list.data = [];
		});
}

function getThemeReducers(builder: ActionReducerMapBuilder<ThemeState>) {
	builder
		.addCase(getTheme.pending, (state) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			state.detail.data = undefined;
		})
		.addCase(getTheme.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getTheme.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get theme';
			state.detail.data = undefined;
		});
}

function createThemeReducers(builder: ActionReducerMapBuilder<ThemeState>) {
	builder
		.addCase(createTheme.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createTheme.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
		})
		.addCase(createTheme.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create theme';
		});
}

function updateThemeReducers(builder: ActionReducerMapBuilder<ThemeState>) {
	builder
		.addCase(updateTheme.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateTheme.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((t) => t.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateTheme.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update theme';
		});
}

function deleteThemeReducers(builder: ActionReducerMapBuilder<ThemeState>) {
	builder
		.addCase(deleteTheme.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteTheme.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((t) => t.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteTheme.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete theme';
		});
}


export const actions = {
	...themeSlice.actions,
};

export const { reducer } = themeSlice;
