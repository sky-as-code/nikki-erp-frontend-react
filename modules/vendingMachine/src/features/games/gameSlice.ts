import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { gameService } from './gameService';
import { Game, GameVersion } from './types';



export const SLICE_NAME = 'vendingMachine.game';

export type GameState = {
	detail: ReduxActionState<Game>;
	list: ReduxActionState<Game[]>;
	create: ReduxActionState<Game>;
	update: ReduxActionState<Game>;
	delete: ReduxActionState<void>;
	addVersion: ReduxActionState<Game>;
	deleteVersion: ReduxActionState<Game>;
};

export const initialGameState: GameState = {
	detail: baseReduxActionState,
	list: { ...baseReduxActionState, data: [] },
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	addVersion: baseReduxActionState,
	deleteVersion: baseReduxActionState,
};


export const listGames = createAsyncThunk<
	Game[],
	void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listGames`,
	async (_, { rejectWithValue }) => {
		try {
			const result = await gameService.listGames();
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list games';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getGame = createAsyncThunk<
	Game | undefined,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getGame`,
	async (id, { rejectWithValue }) => {
		try {
			const result = await gameService.getGame(id);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get game';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createGame = createAsyncThunk<
	Game,
	Omit<Game, 'id' | 'createdAt' | 'etag'>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createGame`,
	async (game, { rejectWithValue }) => {
		try {
			const result = await gameService.createGame(game);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create game';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateGame = createAsyncThunk<
	Game,
	{ id: string; etag: string; updates: Partial<Omit<Game, 'id' | 'createdAt' | 'etag'>> },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateGame`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			const result = await gameService.updateGame(id, etag, updates);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update game';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteGame = createAsyncThunk<
	void,
	{ id: string; },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteGame`,
	async ({ id }, { rejectWithValue }) => {
		try {
			await gameService.deleteGame(id);
			return undefined;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete game';
			return rejectWithValue(errorMessage);
		}
	},
);

export const addGameVersion = createAsyncThunk<
	Game,
	{ gameId: string; version: GameVersion },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/addGameVersion`,
	async ({ gameId, version }, { rejectWithValue }) => {
		try {
			const result = await gameService.addGameVersion(gameId, version);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to add game version';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteGameVersion = createAsyncThunk<
	Game,
	{ gameId: string; versionCode: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteGameVersion`,
	async ({ gameId, versionCode }, { rejectWithValue }) => {
		try {
			const result = await gameService.deleteGameVersion(gameId, versionCode);
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete game version';
			return rejectWithValue(errorMessage);
		}
	},
);

const gameSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialGameState,
	reducers: {
		setGames: (state, action: PayloadAction<Game[]>) => {
			state.list.data = action.payload;
		},
		resetCreateGame: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateGame: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteGame: (state) => {
			state.delete = baseReduxActionState;
		},
		resetAddVersion: (state) => {
			state.addVersion = baseReduxActionState;
		},
		resetDeleteVersion: (state) => {
			state.deleteVersion = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listGamesReducers(builder);
		getGameReducers(builder);
		createGameReducers(builder);
		updateGameReducers(builder);
		deleteGameReducers(builder);
		addGameVersionReducers(builder);
		deleteGameVersionReducers(builder);
	},
});

function listGamesReducers(builder: ActionReducerMapBuilder<GameState>) {
	builder
		.addCase(listGames.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listGames.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.data = action.payload;
			state.list.error = null;
		})
		.addCase(listGames.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list games';
			state.list.data = [];
		});
}

function getGameReducers(builder: ActionReducerMapBuilder<GameState>) {
	builder
		.addCase(getGame.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getGame.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getGame.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get game';
			state.detail.data = undefined;
		});
}

function createGameReducers(builder: ActionReducerMapBuilder<GameState>) {
	builder
		.addCase(createGame.pending, (state, _action) => {
			state.create.status = 'pending';
			state.create.error = null;
		})
		.addCase(createGame.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			if (state.list.data) {
				state.list.data.push(action.payload);
			}
		})
		.addCase(createGame.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create game';
		});
}

function updateGameReducers(builder: ActionReducerMapBuilder<GameState>) {
	builder
		.addCase(updateGame.pending, (state, _action) => {
			state.update.status = 'pending';
			state.update.error = null;
		})
		.addCase(updateGame.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((g) => g.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(updateGame.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update game';
		});
}

function deleteGameReducers(builder: ActionReducerMapBuilder<GameState>) {
	builder
		.addCase(deleteGame.pending, (state, _action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
		})
		.addCase(deleteGame.fulfilled, (state, action) => {
			state.delete.status = 'success';
			if (state.list.data) {
				state.list.data = state.list.data.filter((g) => g.id !== action.meta.arg.id);
			}
			if (state.detail.data?.id === action.meta.arg.id) {
				state.detail.data = undefined;
			}
		})
		.addCase(deleteGame.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete game';
		});
}

function addGameVersionReducers(builder: ActionReducerMapBuilder<GameState>) {
	builder
		.addCase(addGameVersion.pending, (state, _action) => {
			state.addVersion.status = 'pending';
			state.addVersion.error = null;
		})
		.addCase(addGameVersion.fulfilled, (state, action) => {
			state.addVersion.status = 'success';
			state.addVersion.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((g) => g.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(addGameVersion.rejected, (state, action) => {
			state.addVersion.status = 'error';
			state.addVersion.error = action.payload || 'Failed to add game version';
		});
}

function deleteGameVersionReducers(builder: ActionReducerMapBuilder<GameState>) {
	builder
		.addCase(deleteGameVersion.pending, (state, _action) => {
			state.deleteVersion.status = 'pending';
			state.deleteVersion.error = null;
		})
		.addCase(deleteGameVersion.fulfilled, (state, action) => {
			state.deleteVersion.status = 'success';
			state.deleteVersion.data = action.payload;
			state.detail.data = action.payload;
			if (state.list.data) {
				const listIndex = state.list.data.findIndex((g) => g.id === action.payload.id);
				if (listIndex >= 0) {
					state.list.data[listIndex] = action.payload;
				}
			}
		})
		.addCase(deleteGameVersion.rejected, (state, action) => {
			state.deleteVersion.status = 'error';
			state.deleteVersion.error = action.payload || 'Failed to delete game version';
		});
}


export const actions = {
	...gameSlice.actions,
};

export const { reducer } = gameSlice;
