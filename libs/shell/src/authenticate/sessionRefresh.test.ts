import { ClientErrors } from '@nikkierp/common/types';
import { getServiceSlice } from '@nikkierp/ui/appState/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	AuthService, authService, ensureSession, initAuthService, isAuthenticated, keepAliveIntervalMs,
	startSessionKeepAlive, stopSessionKeepAlive,
} from './authService';
import { shellStore } from '../appState/shellStore';

import type { ISessionStorage, SessionExpiry } from './types';


/**
 * The session is refreshed lazily, from the request hook, and kept sliding by a timer. These pin
 * what the UI relies on: the refresh is shared by concurrent requests, and every change in whether
 * a session exists lands in the store, since neither the cookies nor storage are visible to React.
 */

function memoryStorage(initial: SessionExpiry | null): ISessionStorage {
	let current = initial;
	return {
		get: () => current,
		set: (expiry: SessionExpiry) => {
			current = expiry;
		},
		clear: () => {
			current = null;
		},
	};
}

const inOneHour = () => Date.now() + 3_600_000;
const ago = () => Date.now() - 1_000;
const unauthenticated = [{ type: 'authorization', key: 'common:err_unauthenticated', message: 'no' }];

const refreshSession = vi.fn();
let storage: ISessionStorage;

function init(accessExpiresAt: number, refreshExpiresAt: number): void {
	storage = memoryStorage({ accessExpiresAt, refreshExpiresAt });
	initAuthService({ strategy: { refreshSession } as any, sessionStorage: storage });
}

beforeEach(() => {
	refreshSession.mockReset();
	refreshSession.mockResolvedValue({
		accessTokenExpiresAt: new Date(inOneHour()).toISOString(),
		refreshTokenExpiresAt: new Date(inOneHour() * 2).toISOString(),
	});
	shellStore.dispatch(getServiceSlice(AuthService)!.resetActions.setSessionState() as any);
});

describe('ensureSession', () => {
	it('trusts a live access cookie without refreshing', async () => {
		init(inOneHour(), inOneHour());

		expect(await ensureSession()).toBe(true);
		expect(refreshSession).not.toHaveBeenCalled();
	});

	it('refreshes regardless when forced', async () => {
		init(inOneHour(), inOneHour());

		expect(await ensureSession({ force: true })).toBe(true);
		expect(refreshSession).toHaveBeenCalledOnce();
	});

	it('shares one refresh between concurrent requests and stores the new expiry', async () => {
		init(ago(), inOneHour());

		const results = await Promise.all([ensureSession(), ensureSession(), ensureSession()]);

		expect(results).toEqual([true, true, true]);
		expect(refreshSession).toHaveBeenCalledTimes(1);
		expect(storage.get()!.accessExpiresAt).toBeGreaterThan(Date.now());
		expect(authService.readSessionState()).toBe('active');
	});

	it('refreshes inside the 30 s margin, before the server can refuse the cookie', async () => {
		init(Date.now() + 5_000, inOneHour());

		expect(await ensureSession()).toBe(true);
		expect(refreshSession).toHaveBeenCalledTimes(1);
	});

	it('keeps a still-valid cookie when the early refresh fails technically', async () => {
		init(Date.now() + 5_000, inOneHour());
		refreshSession.mockRejectedValue(new Error('network down'));

		expect(await ensureSession()).toBe(true);
		expect(authService.readSessionState()).toBeNull();
	});

	it('records a lost session without a request once the refresh expiry has passed', async () => {
		init(ago(), ago());

		expect(await ensureSession()).toBe(false);
		expect(refreshSession).not.toHaveBeenCalled();
		expect(authService.readSessionState()).toBe('none');
	});

	it('records a lost session and forgets the expiry when the refresh is refused', async () => {
		init(ago(), inOneHour());
		refreshSession.mockRejectedValue(ClientErrors.from(unauthenticated));

		expect(await ensureSession()).toBe(false);
		expect(storage.get()).toBeNull();
		expect(authService.readSessionState()).toBe('none');
	});
});

describe('isAuthenticated', () => {
	it('counts a refresh cookie as a usable session', () => {
		init(ago(), inOneHour());
		expect(isAuthenticated()).toBe(true);
	});

	it('is false when neither cookie is usable', () => {
		init(ago(), ago());
		expect(isAuthenticated()).toBe(false);
	});
});

describe('session keep-alive', () => {
	afterEach(() => {
		stopSessionKeepAlive();
		vi.useRealTimers();
	});

	it('ticks at half the access lifetime, never under 30 s', () => {
		expect(keepAliveIntervalMs(900_000)).toBe(450_000);
		expect(keepAliveIntervalMs(40_000)).toBe(30_000);
		expect(keepAliveIntervalMs(null)).toBe(30_000);
		expect(keepAliveIntervalMs(-5_000)).toBe(30_000);
	});

	it('refreshes on the tick before which the access cookie would lapse', async () => {
		vi.useFakeTimers();
		init(Date.now() + 120_000, inOneHour());

		startSessionKeepAlive();
		await vi.advanceTimersByTimeAsync(60_000);

		expect(refreshSession).toHaveBeenCalledOnce();
	});

	it('stops ticking once stopped', async () => {
		vi.useFakeTimers();
		init(Date.now() + 120_000, inOneHour());

		startSessionKeepAlive();
		stopSessionKeepAlive();
		await vi.advanceTimersByTimeAsync(600_000);

		expect(refreshSession).not.toHaveBeenCalled();
	});
});
