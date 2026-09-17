import { selectSliceState } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { UserContextOrg } from './types';
import { UserContextService } from './userContextService';


/**
 * The org list, selected on its own rather than from `userContextSelectors`.
 *
 * `activeOrg` needs it and `userContextSelectors` needs `activeOrg` — keeping the selector in
 * either would make those two modules import each other. This is the shared leaf that breaks
 * that cycle.
 */
export const selectMyOrgs = createSelector(
	selectSliceState(UserContextService),
	(state: any) => (state?.getUserContext?.data?.orgs ?? []) as UserContextOrg[],
);
