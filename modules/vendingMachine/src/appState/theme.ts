import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listThemes,
	getTheme,
	createTheme,
	updateTheme,
	deleteTheme,
	ThemeState,
	initialThemeState,
} from '@/features/themes/themeSlice';


const STATE_KEY = 'theme';

export const themeReducer = {
	[STATE_KEY]: reducer,
};

export const themeActions = {
	listThemes,
	getTheme,
	createTheme,
	updateTheme,
	deleteTheme,
	...actions,
};

export const selectThemeState = (state: { [STATE_KEY]?: ThemeState }) => state?.[STATE_KEY] ?? initialThemeState;

export const selectThemeList = createSelector(
	selectThemeState,
	(state) => state.list,
);

export const selectThemeDetail = createSelector(
	selectThemeState,
	(state) => state.detail,
);

export const selectCreateTheme = createSelector(
	selectThemeState,
	(state) => state.create,
);

export const selectUpdateTheme = createSelector(
	selectThemeState,
	(state) => state.update,
);

export const selectDeleteTheme = createSelector(
	selectThemeState,
	(state) => state.delete,
);
