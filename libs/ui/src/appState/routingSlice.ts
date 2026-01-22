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
	activeOrg: string | null,
	activeModule: string | null,
};

const initialState: RoutingState = {
	...getActualPath(),
	activeOrg: null,
	activeModule: null,
};

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

			// Check if destination is the same path or a sub-path of current path
			// This ensures we only preserve returnTo when navigating deeper into the same route hierarchy
			const isSameOrSubPath = destPath.pathname === actual.currentPath ||
				(actual.currentPath !== '/' && destPath.pathname.startsWith(actual.currentPath + '/'));
			const returnTo = isSameOrSubPath ? actual.returnTo ?? '/' : `${actual.currentPath}${actual.search}`;

			state.returnTo = encodeURIComponent(returnTo);
			searchParams.set('returnTo', state.returnTo);

			finalPath += `?${searchParams.toString()}`;

			state.action = 'navigateTo';
			state.actionUpdatedAt = Date.now();
			state.actionParams = {
				to: finalPath,
			};
		},
		navigateReturnTo: (state, action: PayloadAction<string | null | undefined>) => {
			state.action = 'navigateTo';
			state.actionUpdatedAt = Date.now();
			state.actionParams = {
				to: decodeURIComponent(action.payload ?? '/'),
			};
		},
		navigateTo: (state, action: PayloadAction<string>) => {
			state.action = 'navigateTo';
			state.actionUpdatedAt = Date.now();
			state.actionParams = {
				to: action.payload,
			};
		},
		setActiveOrg: (state, action: PayloadAction<string | undefined | null>) => {
			state.activeOrg = action.payload ?? null;
		},
		setActiveModule: (state, action: PayloadAction<string | undefined | null>) => {
			state.activeModule = action.payload ?? null;
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
		returnTo: returnTo ? decodeURIComponent(returnTo) : null,
	};
}

export const {
	resetCurrentPath: resetCurrentPathAction,
	tempNavigateTo: tempNavigateToAction,
	navigateReturnTo: navigateReturnToAction,
	navigateTo: navigateToAction,
	setActiveOrg: setActiveOrgAction,
	setActiveModule: setActiveModuleAction,
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
const selectActiveOrgModule = createSelector(
	selectRoutingState,
	(state: RoutingState) => ({
		moduleSlug: state.activeModule,
		orgSlug: state.activeOrg,
	}),
);

export const useActiveOrgModule = () => useSelector(selectActiveOrgModule);
export const useRoutingAction = () => useSelector(selectAction);
export const useRoutingState = () => useSelector(selectRoutingState);
export const useCurrentStoredPath = () => useSelector(selectCurrentPath);

