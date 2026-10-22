import { describe, expect, it } from 'vitest';

import { selectIsAuthenticated } from './authSelectors';
import { SLICE_NAME as AUTH_SLICE } from './authService';
import { SLICE_NAME as USER_CONTEXT_SLICE } from '../userContext/types';


function stateWith(sessionState: string | null, getUserContext: { status: string | null, data: unknown }) {
	return {
		[AUTH_SLICE]: { setSessionState: sessionState },
		[USER_CONTEXT_SLICE]: { getUserContext },
	};
}

const loaded = { status: 'fulfilled', data: { id: 'u1' } };

describe('selectIsAuthenticated', () => {
	it('is true once the context has loaded, before any token was refreshed', () => {
		expect(selectIsAuthenticated(stateWith(null, loaded))).toBe(true);
	});

	it('stays true across a token refresh', () => {
		expect(selectIsAuthenticated(stateWith('active', loaded))).toBe(true);
	});

	it('is false once the session is lost', () => {
		expect(selectIsAuthenticated(stateWith('none', loaded))).toBe(false);
	});

	it('stays true while the context is refetched over loaded data', () => {
		expect(selectIsAuthenticated(stateWith('active', { status: 'pending', data: { id: 'u1' } }))).toBe(true);
	});

	it('is false before the context has loaded', () => {
		expect(selectIsAuthenticated(stateWith(null, { status: 'pending', data: null }))).toBe(false);
	});
});
