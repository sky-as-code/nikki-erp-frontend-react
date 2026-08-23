import { shellStore } from '@nikkierp/shell/appState/shellStore';
import { storeService, storeSyncMethod } from '@nikkierp/ui/appState/store';

import { SharedState, ShellEnvVarBag, SLICE_NAME } from './types';


function buildInitialState(): SharedState {
	return {
		setCurrentOrgId: null,
		setCurrentModule: null,
		setEnvVars: null,
	};
}

/**
 * The org and module the user is currently working in — the answer to "which org scopes the
 * request I am about to make?".
 *
 * Distinct from `routing`, which holds the org and module **slugs** taken from the URL. What an
 * API call needs is the org **id**, and resolving slug → id requires the org list from
 * `v1/iam/me/context`, which arrives asynchronously. This service is where that resolved id
 * lands so a caller does not have to redo the lookup — or wait for it — on every request.
 *
 * Written by the Shell (the org/module switchers, and the layouts that re-derive state from the
 * URL on a hard reload); read by feature modules over the command bus.
 */
@storeService(SLICE_NAME, shellStore, { initialState: buildInitialState() })
export class SharedStateService {
	@storeSyncMethod
	public setCurrentOrgId(orgId: string | null | undefined): string | null {
		return orgId ?? null;
	}

	@storeSyncMethod
	public setCurrentModule(moduleSlug: string | null | undefined): string | null {
		return moduleSlug ?? null;
	}

	/**
	 * Stores the env vars the host injected, so micro-apps can read them over the bus.
	 *
	 * Written once at boot by the concrete shell, which is the side that owns
	 * `window.__CLIENT_CONFIG__`. `libs/shell` cannot do it: it is the library `modules/shell` is
	 * built on, so the dependency only runs one way.
	 */
	@storeSyncMethod
	public setEnvVars(envVars: ShellEnvVarBag | null | undefined): ShellEnvVarBag | null {
		return envVars ?? null;
	}

	/**
	 * Reads the slice directly rather than through a selector, for command-bus callers that
	 * have no React context to select from. Same escape hatch as
	 * `RoutingService.getActiveContext`.
	 */
	public getCurrentOrgId(): string | null {
		return this.readState()?.setCurrentOrgId ?? null;
	}

	public getCurrentModule(): string | null {
		return this.readState()?.setCurrentModule ?? null;
	}

	/**
	 * Empty bag rather than null when unset: every caller reads individual keys off the result,
	 * and a missing key already means "not configured" to them.
	 */
	public getEnvVars(): ShellEnvVarBag {
		return this.readState()?.setEnvVars ?? {};
	}

	private readState(): SharedState | undefined {
		return (shellStore.getState() as Record<string, SharedState | undefined>)[SLICE_NAME];
	}
}

export const sharedStateService = new SharedStateService();
