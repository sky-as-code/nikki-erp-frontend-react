import { describe, expect, it } from 'vitest';

import { authzRequirement } from './permissions';


describe('authzRequirement', () => {
	it('names the iam resource and code the backend asserts, at tenant scope', () => {
		expect(authzRequirement('role', 'view')).toEqual({ action: 'read', resource: 'iam_role', scope: 'tenant' });
		expect(authzRequirement('role', 'addEntitlement').action).toBe('manage_entitlements');
		expect(authzRequirement('grantRequest', 'respond')).toEqual({
			action: 'update', resource: 'iam_grant_request', scope: 'tenant',
		});
	});

	it('guards every write on an action with manage_actions on its resource', () => {
		expect(authzRequirement('action', 'create')).toEqual({
			action: 'manage_actions', resource: 'iam_resource', scope: 'tenant',
		});
		expect(authzRequirement('action', 'view').action).toBe('read');
	});
});
