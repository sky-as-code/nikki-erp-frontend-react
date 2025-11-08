import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';


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

export const layoutActions = layoutSlice.actions;

export const { reducer } = layoutSlice;

const selectLayoutState = (state: any) => state[SLICE_NAME];

const selectMenuBarItems = createSelector(
	selectLayoutState,
	(state: LayoutState) => state.menuBarItems,
);

export const useLayoutState = () => useSelector(selectLayoutState);
export const useMenuBarItems = () => useSelector(selectMenuBarItems);