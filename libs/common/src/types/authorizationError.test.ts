import { describe, expect, it } from 'vitest';

import { ClientErrorItem } from './common';


/**
 * The backend types "nothing authenticated you" and "you are known and refused" as the same
 * `authorization` error, so only the key tells them apart. Confusing the two signs a user out
 * every time they open a page holding one action they cannot perform, which is what these pin.
 */

function authError(key: string): ClientErrorItem {
	return new ClientErrorItem({ key, message: 'x', type: 'authorization' });
}

describe('isUnauthenticatedError', () => {
	it.each([
		'common:err_unauthenticated',
		'common:err_invalid_access_token',
		'common:err_malformed_access_token',
	])('treats %s as an ended session', key => {
		expect(ClientErrorItem.isUnauthenticatedError(authError(key))).toBe(true);
	});

	it('accepts a bare key as well as a namespaced one', () => {
		expect(ClientErrorItem.isUnauthenticatedError(authError('err_unauthenticated'))).toBe(true);
	});

	// A token error under a different namespace must still end the session rather than degrade
	// into a permission refusal the user cannot act on.
	it('accepts either namespace separator', () => {
		expect(ClientErrorItem.isUnauthenticatedError(authError('authorize.err_invalid_access_token'))).toBe(true);
		expect(ClientErrorItem.isUnauthenticatedError(authError('iam:err_malformed_access_token'))).toBe(true);
	});

	// Guards the suffix match: a key merely ending in one of these words is not the same key.
	it('does not match a key that merely ends with a similar word', () => {
		expect(ClientErrorItem.isUnauthenticatedError(authError('common:err_not_unauthenticated'))).toBe(false);
	});

	// The case that was signing users out: a normal refusal for a grant they do not hold.
	it('does NOT end the session for insufficient permissions', () => {
		const refusal = authError('common:err_insufficient_permissions');

		expect(ClientErrorItem.isAuthorizationError(refusal)).toBe(true);
		expect(ClientErrorItem.isUnauthenticatedError(refusal)).toBe(false);
	});

	it('does not end the session for a non-authorization error', () => {
		const validation = new ClientErrorItem({ key: 'err_required', message: 'x', type: 'validation' });

		expect(ClientErrorItem.isUnauthenticatedError(validation)).toBe(false);
	});

	it('is false for anything that is not a client error', () => {
		expect(ClientErrorItem.isUnauthenticatedError(null)).toBe(false);
		expect(ClientErrorItem.isUnauthenticatedError(new Error('boom'))).toBe(false);
	});
});
