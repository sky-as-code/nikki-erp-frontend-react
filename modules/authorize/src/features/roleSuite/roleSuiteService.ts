import { delay } from '@nikkierp/common/utils';

import { RoleSuite } from './types';
import { fakeRoleSuites, fakeRoles } from '../../mock/fakeData';


export const roleSuiteService = {
	async listRoleSuites(): Promise<RoleSuite[]> {
		await delay(500);
		// Attach roles to role suites
		return Promise.resolve(fakeRoleSuites.map((suite) => ({
			...suite,
			roles: fakeRoles.filter((r) => r.suitesCount && r.suitesCount > 0),
		})));
	},

	async getRoleSuite(id: string): Promise<RoleSuite | undefined> {
		await delay(500);
		const suite = fakeRoleSuites.find((s) => s.id === id);
		if (!suite) return undefined;
		// Attach roles to role suite
		return Promise.resolve({
			...suite,
			roles: fakeRoles.filter((r) => r.suitesCount && r.suitesCount > 0),
		});
	},
};

