import { getServiceSlice } from '@nikkierp/ui/appState/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService, authService, ensureAccessToken, initAuthService, isAuthenticated } from './authService';
import { ITokenStorage, TokenObj } from './types';
import { shellStore } from '../appState/shellStore';


/**
 * The token is refreshed lazily, from the request hook. These pin what the UI relies on: the
 * refresh is shared by concurrent requests, and every change in whether a session exists lands
 * in the store, since storage itself is invisible to React.
 */

function memoryStorage(initial: TokenObj | null): ITokenStorage {
	let current = initial;
	return {
		getToken: () => current,
		setToken: (token: TokenObj) => {
			current = token;
		},
		clear: () => {
			current = null;
		},
	};
}

const inOneHour = () => Date.now() + 3_600_000;
const expired = () => new TokenObj('old', Date.now() - 1_000);

const refreshSession = vi.fn();

function init(access: TokenObj | null, refresh: TokenObj | null): void {
	initAuthService({
		strategy: { refreshSession } as any,
		accessTokenStorage: memoryStorage(access),
		refreshTokenStorage: memoryStorage(refresh),
	});
}

describe('ensureAccessToken', () => {
	beforeEach(() => {
		refreshSession.mockReset();
		refreshSession.mockResolvedValue({
			accessToken: 'new-access',
			accessTokenExpiresAt: new Date(inOneHour()).toISOString(),
		});
		shellStore.dispatch(getServiceSlice(AuthService)!.resetActions.setSessionState() as any);
	});

	it('returns a live token without refreshing', async () => {
		init(new TokenObj('live', inOneHour()), new TokenObj('refresh', inOneHour()));

		expect(await ensureAccessToken()).toBe('live');
		expect(refreshSession).not.toHaveBeenCalled();
	});

	it('shares one refresh between concurrent requests and records an active session', async () => {
		init(expired(), new TokenObj('refresh', inOneHour()));

		const tokens = await Promise.all([ensureAccessToken(), ensureAccessToken(), ensureAccessToken()]);

		expect(tokens).toEqual(['new-access', 'new-access', 'new-access']);
		expect(refreshSession).toHaveBeenCalledTimes(1);
		expect(authService.readSessionState()).toBe('active');
	});

	it('refreshes a token about to expire, before the server can refuse it', async () => {
		init(new TokenObj('lapsing', Date.now() + 5_000), new TokenObj('refresh', inOneHour()));

		expect(await ensureAccessToken()).toBe('new-access');
		expect(refreshSession).toHaveBeenCalledTimes(1);
	});

	it('keeps using a still-valid token when the early refresh fails technically', async () => {
		init(new TokenObj('lapsing', Date.now() + 5_000), new TokenObj('refresh', inOneHour()));
		refreshSession.mockRejectedValue(new Error('network down'));

		expect(await ensureAccessToken()).toBe('lapsing');
		expect(authService.readSessionState()).toBeNull();
	});

	it('records a lost session when the refresh token has expired', async () => {
		init(expired(), expired());

		expect(await ensureAccessToken()).toBe('');
		expect(refreshSession).not.toHaveBeenCalled();
		expect(authService.readSessionState()).toBe('none');
	});
});

describe('isAuthenticated', () => {
	it('counts a refresh token as a usable session', () => {
		init(expired(), new TokenObj('refresh', inOneHour()));
		expect(isAuthenticated()).toBe(true);
	});

	it('is false when neither token is usable', () => {
		init(expired(), expired());
		expect(isAuthenticated()).toBe(false);
	});
});
