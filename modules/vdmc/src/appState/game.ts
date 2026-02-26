import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listGames,
	getGame,
	createGame,
	updateGame,
	deleteGame,
	addGameVersion,
	deleteGameVersion,
	GameState,
	initialGameState,
} from '@/features/games/gameSlice';


const STATE_KEY = 'game';

export const gameReducer = {
	[STATE_KEY]: reducer,
};

export const gameActions = {
	listGames,
	getGame,
	createGame,
	updateGame,
	deleteGame,
	addGameVersion,
	deleteGameVersion,
	...actions,
};

export const selectGameState =
	(state: { [STATE_KEY]?: GameState }) => state?.[STATE_KEY] ?? initialGameState;

export const selectGameList = createSelector(
	selectGameState,
	(state) => state.list,
);

export const selectGameDetail = createSelector(
	selectGameState,
	(state) => state.detail,
);

export const selectCreateGame = createSelector(
	selectGameState,
	(state) => state.create,
);

export const selectUpdateGame = createSelector(
	selectGameState,
	(state) => state.update,
);

export const selectDeleteGame = createSelector(
	selectGameState,
	(state) => state.delete,
);

export const selectAddGameVersion = createSelector(
	selectGameState,
	(state) => state.addVersion,
);

export const selectDeleteGameVersion = createSelector(
	selectGameState,
	(state) => state.deleteVersion,
);
