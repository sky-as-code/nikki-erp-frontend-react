import { beforeEach, describe, expect, it, vi } from 'vitest';

import { shellStore } from '../appState/shellStore';


/**
 * The Shell gates its entire render tree on `settleSession`'s slice data
 * (`ShellProviders` returns `false` until `useIsSessionSettled()` is true), and
 * `PrivateLayout` gates on `getUserContext` reaching `fulfilled`. Both are written only
 * by a *dispatched* thunk.
 *
 * `restoreAuthSession` used to call `this.settleSession()` and
 * `userContextService.getUserContext()` directly. Those run the method bodies and return
 * the right values while writing nothing to the store, so the gate never opened and the
 * app rendered a blank page instead of redirecting to `/signin`. These tests assert the
 * store is actually written.
 */

// These tests run in node: `setLocalSettings` writes localStorage, and `getUserContext`
// mirrors the server's language/theme through it.
const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
	getItem: (key: string) => storage.get(key) ?? null,
	setItem: (key: string, value: string) => { storage.set(key, value); },
	removeItem: (key: string) => { storage.delete(key); },
	clear: () => { storage.clear(); },
});

const restoreSession = vi.fn();
const getUserContextResponse = vi.fn();

vi.mock('@nikkierp/common/request', () => ({
	get: (...args: unknown[]) => getUserContextResponse(...args),
	unwrapResult: (value: unknown) => value,
	RequestMaker: { initDefault: vi.fn(), default: vi.fn() },
}));

async function importAuth() {
	const authModule = await import('./authService');
	const { NikkiAuthenticateStrategy } = await import('./strategies');
	return { authModule, NikkiAuthenticateStrategy };
}

function tokenStorage(token: { token: string, expiresAt: Date, isExpired: boolean } | null) {
	return {
		getToken: () => token,
		setToken: vi.fn(),
		clear: vi.fn(),
	} as any;
}

const validToken = { token: 'access-1', expiresAt: new Date(Date.now() + 60_000), isExpired: false };

/** The server's wire shape — `toUserContext` maps snake_case across, so send that. */
const userContextPayload = {
	id: 'u1',
	avatar_url: null,
	display_name: 'A B',
	email: 'a@b.c',
	entitlements: [],
	orgs: [],
	account_settings: {
		language: {
			id: 'l1', name: 'English', iso_code: 'en', direction: 'ltr',
			decimal_separator: '.', thousands_separator: ',', date_format: 'DD/MM/YYYY',
			time_format: 'HH:mm', short_time_format: 'HH:mm', first_day_of_week: 'monday',
		},
		supported_languages: ['en'],
		timezone: 'UTC',
		theme_mode: 'light',
	},
	system_settings: { app_name: 'Nikki' },
};


describe('session boot writes the gates the Shell renders on', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getUserContextResponse.mockResolvedValue(userContextPayload);
		restoreSession.mockReset();
	});

	it('settles the session in the store when there is no token', async () => {
		const { authModule } = await importAuth();
		authModule.initAuthService({
			strategy: { refreshSession: restoreSession } as any,
			accessTokenStorage: tokenStorage(null),
			refreshTokenStorage: tokenStorage(null),
		});

		const restored = await authModule.authService.restoreAuthSession();

		expect(restored).toBe(false);
		// The blank-screen assertion: without a dispatch this stays null forever.
		const auth = shellStore.getState()[authModule.SLICE_NAME] as any;
		expect(auth.settleSession.data).toBe(true);
		expect(auth.settleSession.status).toBe('fulfilled');
	});

	it('loads the user context into the store before settling', async () => {
		const { authModule } = await importAuth();
		const { SLICE_NAME: USER_CONTEXT_SLICE } = await import('../userContext/types');
		authModule.initAuthService({
			strategy: { refreshSession: restoreSession } as any,
			accessTokenStorage: tokenStorage(validToken),
			refreshTokenStorage: tokenStorage(validToken),
		});

		const restored = await authModule.authService.restoreAuthSession();

		expect(restored).toBe(true);
		const userContext = shellStore.getState()[USER_CONTEXT_SLICE] as any;
		// `useIsAuthenticated` requires exactly this, so a direct call left the app blank.
		expect(userContext.getUserContext.status).toBe('fulfilled');

		const auth = shellStore.getState()[authModule.SLICE_NAME] as any;
		expect(auth.settleSession.data).toBe(true);
	});

	it('settles only after the context has landed, never before', async () => {
		const { authModule } = await importAuth();
		const { SLICE_NAME: USER_CONTEXT_SLICE } = await import('../userContext/types');
		const { AuthService } = authModule;
		const { UserContextService } = await import('../userContext/userContextService');

		// `shellStore` is a module singleton, so the earlier tests leave both slices
		// settled. Reset them, or the subscriber below latches onto stale state.
		const { getServiceSlice } = await import('@nikkierp/ui/appState/store');
		shellStore.dispatch(getServiceSlice(AuthService)!.resetActions.settleSession() as any);
		shellStore.dispatch(getServiceSlice(UserContextService)!.resetActions.getUserContext() as any);

		// If settle were to land first, `PrivateLayout` would see a truthy `restore.data`
		// with a false `isAuthenticated` and would neither render nor redirect.
		let contextStatusWhenSettled: string | null = null;
		getUserContextResponse.mockImplementation(async () => {
			await Promise.resolve();
			return userContextPayload;
		});

		authModule.initAuthService({
			strategy: { refreshSession: restoreSession } as any,
			accessTokenStorage: tokenStorage(validToken),
			refreshTokenStorage: tokenStorage(validToken),
		});

		// Latch on the *first* sign of settling, pending included: the gate opens on
		// `settleSession.data`, so what matters is that the context is already fulfilled
		// by the time settling starts at all.
		const unsubscribe = shellStore.store.subscribe(() => {
			const auth = shellStore.getState()[authModule.SLICE_NAME] as any;
			if (auth.settleSession.status !== null && contextStatusWhenSettled === null) {
				const userContext = shellStore.getState()[USER_CONTEXT_SLICE] as any;
				contextStatusWhenSettled = userContext.getUserContext.status;
			}
		});

		await authModule.authService.restoreAuthSession();
		unsubscribe();

		expect(contextStatusWhenSettled).toBe('fulfilled');
	});
});
