import { useModuleSelector } from '@nikkierp/ui/appState/store';
import { createSelector } from '@reduxjs/toolkit';

import { SLICE_NAME, ShellConfigState } from './shellConfigSlice';
import { ShellEnvVars } from '../types';


const EMPTY_ENV_VARS: ShellEnvVars = {
	BASE_API_URL: '',
	APP_ENV: null,
	ROOT_DOMAIN: '',
	ROOT_PATH: '',
};

// `useModuleSelector` resolves whichever store is in scope. Inside a micro-app that is the
// module's own store, which never carries the Shell's `shellConfig` slice, so the lookup is
// undefined rather than a `ShellConfigState`. Fall back to empty vars instead of throwing —
// callers already treat missing values as "unconfigured" and supply their own defaults.
const selectShellConfig = (state: any) => state?.[SLICE_NAME] as ShellConfigState | undefined;

const selectEnvVars = createSelector(
	selectShellConfig,
	(state: ShellConfigState | undefined) => state?.envVars ?? EMPTY_ENV_VARS,
);

/**
 * Reads from the Shell's own store, not the default react-redux context.
 *
 * @deprecated Only usable from inside the Shell's own store scope. `useModuleSelector` resolves
 * whichever store is in React scope, and in a micro-app that is the module's own store, which
 * never carries the `shellConfig` slice — so this silently returns {@link EMPTY_ENV_VARS} rather
 * than throwing, and the failure surfaces as empty config far from its cause. It also narrows to
 * `ShellEnvVars`, dropping deployment-specific vars such as coremart's `MAPLIBRE_GL_API_KEY`.
 *
 * Existing Shell-internal callers are fine. New modules must publish
 * `shell.shared_state.get_env_vars` on the command bus instead, which crosses store boundaries
 * and returns the whole untyped bag. See `docs/wiki/01. Micro Frontend architecture.md` §3.7 and
 * `coremart/modules/vendingMachineNew/src/common/hooks/useShellEnv.ts` for a worked example.
 *
 * Note the lint zone bans `@nikkierp/microapp-*` inside modules but not `@nikkierp/shell/*`, so a
 * module importing this still lints clean — the boundary is convention, not enforcement.
 */
export const useShellEnvVars = (): ShellEnvVars => useModuleSelector(selectEnvVars);
