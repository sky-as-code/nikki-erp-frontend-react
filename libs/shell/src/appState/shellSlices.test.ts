import { describe, expect, it } from 'vitest';

import { shellStore } from './shellStore';
import { SLICE_NAME as AUTH_SLICE } from '../authenticate/authService';
import { SLICE_NAME as CONFIG_SLICE } from '../config/shellConfigSlice';
import { SLICE_NAME as ROUTING_SLICE } from '../routing/routingService';
import { SLICE_NAME as USER_CONTEXT_SLICE } from '../userContext/types';

// Importing the services is what registers their slices — `@storeService` builds the
// slice on first instantiation, which happens at import time.
import '../authenticate/authService';
import '../erpModules/moduleService';
import '../routing/routingService';
import '../userContext/userContextService';


describe('shellStore slices', () => {
	it('holds every Shell slice', () => {
		for (const slice of [AUTH_SLICE, CONFIG_SLICE, ROUTING_SLICE, USER_CONTEXT_SLICE, 'erpModules']) {
			expect(shellStore.hasSlice(slice), `missing slice: ${slice}`).toBe(true);
		}
	});

	it('gives the auth service one state entry per operation', () => {
		const auth = shellStore.getState()[AUTH_SLICE] as Record<string, unknown>;

		expect(Object.keys(auth).sort()).toEqual([
			'continueSignIn', 'refreshSession', 'restoreAuthSession', 'settleSession', 'signOut', 'startSignIn',
		]);
	});

	it('keeps the non-thunk auth helpers off the slice', () => {
		// `ensureAccessToken` and friends run outside React and outside Redux, so they stay
		// module functions and must not become thunks.
		const auth = shellStore.getState()[AUTH_SLICE] as Record<string, unknown>;

		expect(auth).not.toHaveProperty('ensureAccessToken');
		expect(auth).not.toHaveProperty('isAuthenticated');
	});

	it('gives setLocalSettings the full method-state shape, not just a data field', () => {
		const userContext = shellStore.getState()[USER_CONTEXT_SLICE] as any;

		// The `initialState` override has to spread every key: the reducers mutate
		// `state[methodName].status` in place, so a partial object would leave those
		// undefined. `data` is null here only because Node has no localStorage to seed from.
		expect(userContext.setLocalSettings).toMatchObject({
			status: null, clientErrors: [], error: null, doneAt: 0,
		});
		expect(userContext.setLocalSettings).toHaveProperty('data');
	});
});
