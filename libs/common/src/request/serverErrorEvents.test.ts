import { describe, expect, it, vi } from 'vitest';

import { SERVER_ERROR_TOPIC, ServerFailureError, announceServerError, isAnnouncedServerFailure } from './serverErrorEvents';

import type { IEventBus } from '../eventBus';


function eventBus(): { bus: IEventBus, publish: ReturnType<typeof vi.fn> } {
	const publish = vi.fn();
	return { bus: { publish } as unknown as IEventBus, publish };
}

describe('announceServerError', () => {
	it('publishes a 5xx', () => {
		const { bus, publish } = eventBus();
		announceServerError({ status: 502, url: '/api/v1/x' }, bus);
		expect(publish).toHaveBeenCalledWith(SERVER_ERROR_TOPIC, { status: 502, url: '/api/v1/x' });
	});

	it.each([200, 400, 403, 404, 422])('stays quiet on %i', status => {
		const { bus, publish } = eventBus();
		announceServerError({ status, url: '/api/v1/x' }, bus);
		expect(publish).not.toHaveBeenCalled();
	});
});

describe('isAnnouncedServerFailure', () => {
	it('recognizes the 5xx error and nothing else', () => {
		expect(isAnnouncedServerFailure(new ServerFailureError(500, 'x'))).toBe(true);
		expect(isAnnouncedServerFailure(new Error('x'))).toBe(false);
		expect(isAnnouncedServerFailure(null)).toBe(false);
	});
});
