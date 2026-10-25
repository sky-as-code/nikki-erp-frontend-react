import { selectSliceState, useModuleSelector, useServiceLayer } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';
import { useCallback } from 'react';

import { useActiveOrg } from './activeOrg';
import { selectMyOrgs } from './orgSelectors';
import { DEFAULT_LOCAL_SETTINGS, Density, LocalSettings, ThemeMode, UserContextOrg } from './types';
import { UserContextService, userContextService } from './userContextService';


const selectUserContextState = selectSliceState(UserContextService);

/** The `getUserContext` request state, as `{status, data, clientErrors, error, doneAt}`. */
export const selectGetUserContext = createSelector(
	selectUserContextState,
	(state: any) => state?.getUserContext,
);

export function useGetUserContext() {
	return useServiceLayer(userContextService.getUserContext).result;
}

export function useUserContext() {
	return useGetUserContext().data;
}

export function useAccountSettings() {
	return useGetUserContext().data?.accountSettings ?? null;
}

export function useSystemSettings() {
	return useGetUserContext().data?.systemSettings ?? null;
}

export function useSetLocalSettings() {
	return useServiceLayer(userContextService.setLocalSettings);
}

export function useLocalSettings() {
	return useSetLocalSettings().result.data;
}

/**
 * The stored local settings and a writer that changes some of them.
 *
 * The set command replaces the stored value outright, so every writer sends the whole object with
 * its own change applied; a partial payload would blank the fields it does not name.
 */
function useLocalSettingsPatch(): {
	current: LocalSettings,
	patch: (change: Partial<LocalSettings>) => void,
} {
	const { result, dispatchMethod } = useSetLocalSettings();
	const stored = result.data as LocalSettings | null | undefined;
	const patch = useCallback(
		(change: Partial<LocalSettings>) => dispatchMethod({ ...DEFAULT_LOCAL_SETTINGS, ...stored, ...change }),
		[dispatchMethod, stored],
	);
	return { current: { ...DEFAULT_LOCAL_SETTINGS, ...stored }, patch };
}

/**
 * The user's theme mode and the one way to change it.
 *
 * Writes the Shell's local settings, never Mantine directly: `ApplyStoredTheme` applies them, and a
 * scheme set on Mantine alone was overridden by the stale local value on the next boot.
 */
export function useThemeMode(): { themeMode: ThemeMode, setThemeMode: (mode: ThemeMode) => void } {
	const { current, patch } = useLocalSettingsPatch();
	const setThemeMode = useCallback((themeMode: ThemeMode) => patch({ themeMode }), [patch]);
	return { themeMode: current.themeMode, setThemeMode };
}

/** The user's density and the one way to change it; `ApplyStoredDensity` applies it. */
export function useDensity(): { density: Density, setDensity: (density: Density) => void } {
	const { current, patch } = useLocalSettingsPatch();
	const setDensity = useCallback((density: Density) => patch({ density }), [patch]);
	return { density: current.density, setDensity };
}

/** The user's display language and the one way to change it; see `ApplyStoredLanguage`. */
export function useLanguageCode(): { languageCode: string | null, setLanguageCode: (code: string) => void } {
	const { current, patch } = useLocalSettingsPatch();
	const setLanguageCode = useCallback((languageCode: string) => patch({ languageCode }), [patch]);
	return { languageCode: current.languageCode, setLanguageCode };
}

export function useFirstOrgSlug() {
	return useModuleSelector(selectFirstOrgSlug);
}
export function useMyOrgs() {
	return useModuleSelector(selectMyOrgs);
}
export function useFindMyOrg(orgSlug: string) {
	return useModuleSelector((state: any) => selectFindMyOrg(state, orgSlug));
}


/**
 * The active organization.
 *
 * Both of these used to resolve the org by matching the routing slice's `orgSlug` against the
 * org list. The org is no longer in the URL, so they delegate to `useActiveOrg`, which resolves
 * it from storage. Kept as-is rather than deleted: the remaining callers are in the deprecated
 * `authorize` module, and pointing them at the new source keeps them working without touching it.
 */
export const useActiveOrgWithDetails = () => useActiveOrg();

export const useActiveOrgDetail = () => useActiveOrg();

const selectFindMyOrg = createSelector(
	selectMyOrgs,
	(_: unknown, orgSlug: string) => orgSlug,
	(orgs: UserContextOrg[], orgSlug: string) => orgs.find(o => o.slug === orgSlug) ?? null,
);

const selectFirstOrgSlug = createSelector(
	selectMyOrgs,
	(myOrgs: UserContextOrg[]) => myOrgs[0]?.slug ?? null as (string | null),
);
