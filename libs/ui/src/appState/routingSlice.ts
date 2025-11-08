import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { parsePath } from 'react-router';


export const SLICE_NAME = 'shellRouting';

export type RoutingState = {
	action?: string,
	actionUpdatedAt?: number,
	actionParams?: UnknownRecord,
	currentPath: string,
	returnTo: string | null
};

const initialState: RoutingState = getActualPath();

const routingSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		resetCurrentPath: (state) => {
			const actual = getActualPath();
			state.currentPath = actual.currentPath;
			state.returnTo = actual.returnTo;
		},
		tempNavigateTo: (state, action: PayloadAction<string>) => {
			const actual = getActualPath();
			const destPath = parsePath(action.payload);
			if (!destPath.pathname) {
				throw new Error('Invalid destination path');
			}

			let finalPath = destPath.pathname;
			const searchParams = new URLSearchParams(destPath.search || '');
			state.returnTo = encodeURIComponent(`${actual.currentPath}${actual.search}`);
			searchParams.set('returnTo', state.returnTo);
			finalPath += `?${searchParams.toString()}`;

			state.action = 'navigateTo';
			state.actionUpdatedAt = Date.now();
			state.actionParams = {
				to: finalPath,
			};
		},
		navigateReturnTo: (state) => {
			state.action = 'navigateTo';
			state.actionUpdatedAt = Date.now();
			state.actionParams = {
				to: state.returnTo ? decodeURIComponent(state.returnTo) : '/',
			};
		},
	},
});

function getActualPath() {
	const { pathname, search, hash } = window.location;
	// Use react-router logic to parse the path,
	// so the pathname is consistent with react-router.
	const parsed = parsePath(`${pathname}${search}${hash}`);
	const queryParams = new URLSearchParams(parsed.search || '');
	const returnTo = queryParams.get('returnTo');
	return {
		currentPath: parsed.pathname || '/',
		search: parsed.search ?? '',
		returnTo,
	};
}

export const {
	resetCurrentPath: resetCurrentPathAction,
	tempNavigateTo: tempNavigateToAction,
	navigateReturnTo: navigateReturnToAction,
} = routingSlice.actions;

export const { reducer } = routingSlice;

const selectRoutingState = (state: any) => state[SLICE_NAME];
const selectCurrentPath = createSelector(
	selectRoutingState,
	(state: RoutingState) => state.currentPath,
);
const selectAction = createSelector(
	selectRoutingState,
	(state: RoutingState) => ({
		action: state.action,
		actionUpdatedAt: state.actionUpdatedAt,
		actionParams: state.actionParams,
	}),
);

export const useRoutingAction = () => useSelector(selectAction);
export const useRoutingState = () => useSelector(selectRoutingState);
export const useCurrentStoredPath = () => useSelector(selectCurrentPath);

