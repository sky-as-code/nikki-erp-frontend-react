import { delay } from '@nikkierp/common/utils';

import { Role } from './types';
import { fakeEntitlements, fakeRoles } from '../../mock/fakeData';


export const roleService = {
	async listRoles(): Promise<Role[]> {
		await delay(500);
		// Attach entitlements to roles
		return Promise.resolve(fakeRoles.map((role) => ({
			...role,
			entitlements: fakeEntitlements.filter((e) => e.rolesCount && e.rolesCount > 0),
		})));
	},

	async getRole(id: string): Promise<Role | undefined> {
		await delay(500);
		const role = fakeRoles.find((r) => r.id === id);
		if (!role) return undefined;
		// Attach entitlements to role
		return Promise.resolve({
			...role,
			entitlements: fakeEntitlements.filter((e) => e.rolesCount && e.rolesCount > 0),
		});
	},
};

