import { DEFAULT_TELEMETRY_CONFIG, initTelemetry, shutdownTelemetry, UI_OPERATIONS } from '@nikkierp/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initAuthService, startSessionKeepAlive, stopSessionKeepAlive } from './authService';

import type { SessionExpiry } from './types';
import type { TelemetryConfig, TelemetryOperation } from '@nikkierp/common';


/** FE-03: a keep-alive tick that refreshes is its own root operation; an idle tick traces nothing. */

type EndedSpan = { name: string, parentSpanContext?: unknown };

const inOneHour = () => Date.now() + 3_600_000;
const refreshSession = vi.fn<(operation?: TelemetryOperation) => Promise<unknown>>();
let ended: EndedSpan[];

function init(accessExpiresAt: number): void {
	let current: SessionExpiry | null = { accessExpiresAt, refreshExpiresAt: inOneHour() };
	initAuthService({
		strategy: { refreshSession } as any,
		sessionStorage: {
			get: () => current, set: (expiry: SessionExpiry) => { current = expiry; }, clear: () => { current = null; },
		},
	});
}

beforeEach(async () => {
	await shutdownTelemetry();
	ended = [];
	const processor = {
		onStart: () => undefined,
		onEnd: (span: EndedSpan) => ended.push(span),
		forceFlush: async () => undefined,
		shutdown: async () => undefined,
	};
	initTelemetry({
		...DEFAULT_TELEMETRY_CONFIG, spanProcessors: [processor] as unknown as TelemetryConfig['spanProcessors'],
	});
	refreshSession.mockReset();
	refreshSession.mockResolvedValue({
		accessTokenExpiresAt: new Date(inOneHour()).toISOString(),
		refreshTokenExpiresAt: new Date(inOneHour() * 2).toISOString(),
	});
	vi.useFakeTimers();
});

afterEach(async () => {
	stopSessionKeepAlive();
	vi.useRealTimers();
	await shutdownTelemetry();
});

describe('session keep-alive telemetry', () => {
	it('traces a refreshing tick as its own root operation and hands it to the refresh call', async () => {
		init(Date.now() + 120_000);

		startSessionKeepAlive();
		await vi.advanceTimersByTimeAsync(60_000);

		expect(refreshSession).toHaveBeenCalledOnce();
		expect(refreshSession.mock.calls[0][0]?.name).toBe(UI_OPERATIONS.SESSION_KEEP_ALIVE);
		expect(ended.map(span => span.name)).toEqual([UI_OPERATIONS.SESSION_KEEP_ALIVE]);
		expect(ended[0].parentSpanContext).toBeUndefined();
	});

	it('traces nothing on a tick with nothing to refresh', async () => {
		init(inOneHour());

		startSessionKeepAlive();
		await vi.advanceTimersByTimeAsync(60_000);

		expect(refreshSession).not.toHaveBeenCalled();
		expect(ended).toHaveLength(0);
	});
});
