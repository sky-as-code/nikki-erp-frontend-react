import { describe, expect, it } from 'vitest';

import { resourceTestIdPrefix } from './testIds';


describe('resourceTestIdPrefix', () => {
	it('derives a prefix from the route and the schema entity', () => {
		expect(resourceTestIdPrefix({ routePath: 'users', schemaName: 'iam_user', part: 'List' }))
			.toBe('users.userList');
		expect(resourceTestIdPrefix({ routePath: 'roles', schemaName: 'iam_role', part: 'Detail' }))
			.toBe('roles.roleDetail');
	});

	it('camelCases a multi-word entity', () => {
		expect(resourceTestIdPrefix({ routePath: 'orgunits', schemaName: 'iam_org_unit', part: 'List' }))
			.toBe('orgunits.orgUnitList');
	});

	it('keeps the create and detail variants of one route apart', () => {
		const args = { routePath: 'users', schemaName: 'iam_user' } as const;
		expect(resourceTestIdPrefix({ ...args, part: 'Detail' })).not
			.toBe(resourceTestIdPrefix({ ...args, part: 'Create' }));
	});

	it('takes only the first route segment, so a detail route matches its list', () => {
		expect(resourceTestIdPrefix({ routePath: 'users/:id', schemaName: 'iam_user', part: 'Detail' }))
			.toBe('users.userDetail');
	});

	it('falls back to the schema alone when there is no route, as for an embedded table', () => {
		expect(resourceTestIdPrefix({ schemaName: 'iam_user', part: 'Table' })).toBe('userTable');
	});

	it('keeps a schema name that carries no module prefix intact', () => {
		expect(resourceTestIdPrefix({ routePath: 'kiosks', schemaName: 'kiosk', part: 'List' }))
			.toBe('kiosks.kioskList');
	});

	it('lets an explicit testId win', () => {
		expect(resourceTestIdPrefix({
			testId: 'iam.customUserList', routePath: 'users', schemaName: 'iam_user', part: 'List',
		})).toBe('iam.customUserList');
	});
});
