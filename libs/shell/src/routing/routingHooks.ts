import { useModuleSelector } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { SLICE_NAME } from './routingService';
import { RoutingState } from './types';


// Slice keys are the `RoutingService` method names — that is how `createServiceSlice`
// names its entries. These selectors are the translation to domain names, so nothing
// outside this file has to know that.
const selectRoutingState = (state: any) => state?.[SLICE_NAME] as RoutingState | undefined;

const selectActiveOrgModule = createSelector(
	selectRoutingState,
	(state) => ({
		orgSlug: state?.setActiveOrg ?? null,
		moduleSlug: state?.setActiveModule ?? null,
	}),
);

const selectCurrentPath = createSelector(
	selectRoutingState,
	(state) => state?.resetCurrentPath ?? '/',
);

const selectReturnTo = createSelector(
	selectRoutingState,
	(state) => state?.setReturnTo ?? null,
);

/** The `{orgSlug, moduleSlug}` the Shell is currently showing. */
export const useActiveOrgModule = () => useModuleSelector(selectActiveOrgModule);

/** The path last recorded in state, which may lag the browser's during a navigation. */
export const useCurrentStoredPath = () => useModuleSelector(selectCurrentPath);

export const useReturnTo = () => useModuleSelector(selectReturnTo);

export const useRoutingState = () => useModuleSelector(selectRoutingState);
