import { describe, expect, it } from 'vitest';

import { toManagePrincipalsCall } from './roleService';


describe('toManagePrincipalsCall', () => {
	it('puts the role id in the path, so the request reaches roles/:role_id/manage-users', () => {
		expect(toManagePrincipalsCall({ id: 'R1', add: ['U1'] }, 'manage-users'))
			.toEqual({ path: 'R1/manage-users', body: { add: ['U1'] } });
	});

	it('sends a remove-only delta without an empty add', () => {
		expect(toManagePrincipalsCall({ id: 'R1', add: [], remove: ['G1', 'G2'] }, 'manage-groups'))
			.toEqual({ path: 'R1/manage-groups', body: { remove: ['G1', 'G2'] } });
	});
});
