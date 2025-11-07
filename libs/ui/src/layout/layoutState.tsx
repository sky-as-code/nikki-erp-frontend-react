import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';


export const SLICE_NAME = 'shellLayout';

export type LayoutState = {
	menuBarItems: MenuBarItem[];
};

export type MenuBarItem = {
	label: string;
	link?: string;
	items?: MenuBarItem[];
};

const initialState: LayoutState = {
	menuBarItems: [],
};

const layoutSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		setMenuBarItems: (state, action: PayloadAction<MenuBarItem[]>) => {
			state.menuBarItems = action.payload;
		},
	},
});

export const actions = {
	...layoutSlice.actions,
};

export const { reducer } = layoutSlice;

export const selectLayoutState = (state: any) => state[SLICE_NAME];

export const selectMenuBarItems = createSelector(
	selectLayoutState,
	(state: LayoutState) => state.menuBarItems,
);
