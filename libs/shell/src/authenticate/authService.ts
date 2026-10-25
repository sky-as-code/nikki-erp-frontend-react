import { ClientErrors } from '@nikkierp/common/types';
import {
	dispatchServiceMethod, storeAsyncMethod, storeService, storeSyncMethod,
} from '@nikkierp/ui/appState/store';

import * as t from './types';
import { shellStore } from '../appState/shellStore';
import { loadSessionBootstrap } from '../userContext/sessionBootstrap';
import { userContextService } from '../userContext/userContextService';


export const SLICE_NAME = t.SLICE_NAME;

export type LoginCredentials = Record<string, unknown>;

/** `null` until the first token write or refresh failure; `'none'` once a session is lost. */
export type SessionState = 'active' | 'none';

export type InitAuthServiceParams = {
	strategy: t.ISignInStrategy,
	sessionStorage: t.ISessionStorage,
};

export type EnsureSessionOptions = {
	/** Refreshes even when the stored expiry says the access cookie is still good. */
	force?: boolean,
};

// Module-level rather than instance fields: the helpers below are called from outside
// React and outside Redux (`RequestMaker.initDefault`, `useApiOptions`), where there is
// no dispatch and no way to reach the service instance.
let strategy: t.ISignInStrategy;
let expiryStorage: t.ISessionStorage;
let refreshInFlight: Promise<boolean> | null = null;
/** The access cookie's lifetime as last issued; unknown until this tab signs in or refreshes. */
let accessTtlMs: number | null = null;
let keepAliveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Refreshes this long before expiry, so a cookie that passes the client check is not refused by
 * the server a moment later -- which would send the user to `/signin` for no reason.
 */
const ACCESS_TOKEN_REFRESH_MARGIN_MS = 30_000;
const KEEP_ALIVE_MIN_INTERVAL_MS = 30_000;


export function initAuthService(params: InitAuthServiceParams): void {
	strategy = params.strategy;
	expiryStorage = params.sessionStorage;
	refreshInFlight = null;
	accessTtlMs = null;
}

// These are reachable over the command bus, which is registered before
// `initAuthService` has necessarily run, so each tolerates an uninitialized storage
// rather than throwing at a caller that only asked whether a session exists.
export function getSessionExpiresAt(): Date | null {
	const expiry = expiryStorage?.get();
	return expiry ? new Date(expiry.accessExpiresAt) : null;
}

export function clearAuthSession(): void {
	expiryStorage?.clear();
	markSession('none');
}

/**
 * Whether a usable session exists: a live access cookie, or a refresh cookie to get one.
 *
 * Not for render gating -- storage is invisible to React. Components use `useIsAuthenticated`.
 */
export function isAuthenticated(): boolean {
	const expiry = expiryStorage?.get();
	return Boolean(expiry && (!hasLapsed(expiry.accessExpiresAt, 0) || !hasLapsed(expiry.refreshExpiresAt, 0)));
}

/**
 * Whether the access cookie is usable, refreshing it first when it lapses within the margin.
 *
 * `RequestMaker` awaits this before every request, so it must stay a plain function: it runs
 * outside React and has no dispatch to reach a thunk with.
 */
export async function ensureSession(options: EnsureSessionOptions = {}): Promise<boolean> {
	const expiry = expiryStorage?.get() ?? null;
	if (!options.force && expiry && !hasLapsed(expiry.accessExpiresAt, ACCESS_TOKEN_REFRESH_MARGIN_MS)) {
		return true;
	}
	try {
		return await refreshOnce();
	}
	catch (error) {
		// A transient refresh failure inside the margin: the current cookie still works.
		if (expiry && !hasLapsed(expiry.accessExpiresAt, 0)) return true;
		throw error;
	}
}

/**
 * Keeps an idle tab's session sliding: without requests nothing would refresh, and the refresh
 * cookie would lapse under a user who merely left the page open. Returns the stop function.
 */
export function startSessionKeepAlive(): () => void {
	stopSessionKeepAlive();
	scheduleKeepAlive();
	return stopSessionKeepAlive;
}

export function stopSessionKeepAlive(): void {
	if (keepAliveTimer) clearTimeout(keepAliveTimer);
	keepAliveTimer = null;
}

/** Half the access lifetime, so one tick always lands before it lapses; never tighter than the floor. */
export function keepAliveIntervalMs(ttlMs: number | null): number {
	return Math.max(KEEP_ALIVE_MIN_INTERVAL_MS, Math.floor((ttlMs ?? 0) / 2));
}

function scheduleKeepAlive(): void {
	const expiry = expiryStorage?.get();
	const intervalMs = keepAliveIntervalMs(accessTtlMs ?? (expiry ? expiry.accessExpiresAt - Date.now() : null));
	keepAliveTimer = setTimeout(() => {
		void keepAliveTick(intervalMs).finally(() => {
			if (keepAliveTimer) scheduleKeepAlive();
		});
	}, intervalMs);
}

/** Refreshes now when the access cookie would lapse before the next tick. */
async function keepAliveTick(intervalMs: number): Promise<void> {
	const expiry = expiryStorage?.get();
	if (!expiry || hasLapsed(expiry.refreshExpiresAt, 0)) return;
	const lapsesBeforeNextTick = hasLapsed(expiry.accessExpiresAt, intervalMs + ACCESS_TOKEN_REFRESH_MARGIN_MS);
	await ensureSession({ force: lapsesBeforeNextTick }).catch(() => false);
}

function hasLapsed(expiresAt: number, marginMs: number): boolean {
	return expiresAt - marginMs < Date.now();
}

/** Every request racing past a lapsing cookie shares one refresh call. */
function refreshOnce(): Promise<boolean> {
	refreshInFlight ??= restoreSession().finally(() => {
		refreshInFlight = null;
	});
	return refreshInFlight;
}

/** A thrown error is a technical failure, not a refusal, so it leaves the session state alone. */
async function restoreSession(): Promise<boolean> {
	const expiry = expiryStorage?.get();
	if (!expiry || hasLapsed(expiry.refreshExpiresAt, 0)) {
		markSession('none');
		return false;
	}
	try {
		onSignInSuccess(await strategy.refreshSession());
		return true;
	}
	catch (error) {
		if (ClientErrors.containsAuthorizationError(error)) {
			clearAuthSession();
			return false;
		}
		throw error;
	}
}

function onSignInSuccess(session: t.AuthenticatedSession): void {
	const accessExpiresAt = new Date(session.accessTokenExpiresAt).getTime();
	expiryStorage.set({ accessExpiresAt, refreshExpiresAt: new Date(session.refreshTokenExpiresAt).getTime() });
	accessTtlMs = accessExpiresAt - Date.now();
	markSession('active');
}

/**
 * The cookies are invisible to script and storage to React, so every change in whether a session
 * exists is also dispatched. `useIsAuthenticated` reads this rather than the expiry: a lapsed access
 * cookie is not a lost session -- the next request refreshes it -- only a failed refresh is.
 */
function markSession(state: SessionState): void {
	if (authService.readSessionState() === state) return;
	void dispatchServiceMethod(authService.setSessionState, state);
}


/** Sign-in, sign-out and session restoration. */
@storeService(SLICE_NAME, shellStore)
export class AuthService {
	@storeAsyncMethod
	public async startSignIn(params: t.StartSignInParams): Promise<t.StartSignInResult> {
		return strategy.startSignIn(params);
	}

	/**
	 * Completes sign-in and, on success, loads the user context.
	 *
	 * Dispatched rather than called directly: a bare `userContextService.getUserContext()`
	 * runs the fetch but records nothing, and `useIsAuthenticated` gates on that slice
	 * reaching `fulfilled`.
	 */
	@storeAsyncMethod
	public async continueSignIn(params: t.SignInParams): Promise<t.SignInResult> {
		const result = await strategy.continueSignIn(params);
		if (result?.done) {
			onSignInSuccess(result.data!);
			await loadSessionBootstrap();
			await dispatchServiceMethod(userContextService.getUserContext);
		}
		return result;
	}

	@storeAsyncMethod
	public async refreshSession(): Promise<t.AuthenticatedSession> {
		const result = await strategy.refreshSession();
		onSignInSuccess(result);
		return result;
	}

	/**
	 * The server call is awaited so its cookie-clearing response lands before the caller navigates
	 * away, but never allowed to fail the sign-out: a user who asked to leave must be signed out.
	 */
	@storeAsyncMethod
	public async signOut(): Promise<void> {
		stopSessionKeepAlive();
		await strategy.signOut().catch(() => undefined);
		clearAuthSession();
	}

	/**
	 * Restores a session from the refresh cookie, then settles.
	 *
	 * Both steps are dispatched, not called: the Shell gates its entire render tree on
	 * `settleSession`'s slice data, so a direct call leaves the app blank forever.
	 *
	 * The context is awaited before settling rather than loaded in a detached microtask.
	 * `useIsAuthenticated` requires `getUserContext` to be fulfilled, so settling first
	 * would publish a torn state — `PrivateLayout` would see a truthy `restore.data`
	 * alongside a false `isAuthenticated` and would neither render nor redirect. Settling
	 * last costs one round trip before first paint and makes the signal mean what it says.
	 */
	@storeAsyncMethod
	public async restoreAuthSession(): Promise<boolean> {
		const hasSession = await ensureSession();
		if (!hasSession) {
			await dispatchServiceMethod(this.settleSession);
			return false;
		}

		// One round trip for the context, the languages and the modules; it seeds the context
		// the dispatch below reads, so the gate still opens on `getUserContext` as before.
		await loadSessionBootstrap();
		await dispatchServiceMethod(userContextService.getUserContext);
		await dispatchServiceMethod(this.settleSession);

		return true;
	}

	/**
	 * Marks that no further attempt will be made to authenticate or restore.
	 *
	 * Components gate on this to know whether reading the user context is meaningful yet,
	 * or whether they should keep waiting.
	 */
	@storeAsyncMethod
	public async settleSession(): Promise<boolean> {
		return true;
	}

	/** Written by the session helpers above, not by callers. */
	@storeSyncMethod
	public setSessionState(state: SessionState): SessionState {
		return state;
	}

	public readSessionState(): SessionState | null {
		const slice = shellStore.getState()[SLICE_NAME] as { setSessionState?: SessionState | null } | undefined;
		return slice?.setSessionState ?? null;
	}
}

export const authService = new AuthService();
