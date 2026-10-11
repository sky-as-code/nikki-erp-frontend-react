import { describe, expect, it } from 'vitest';

import { resourceTablePropsSchema } from './props';


const base = { schemaName: 'iam_user', translationNs: 'iam', searchCommand: 'iam.user.search' };

describe('resourceTablePropsSchema', () => {
	it('leaves the View all link off unless a page asks for it', () => {
		expect(resourceTablePropsSchema.parse(base).showViewAll).toBe(false);
		expect(resourceTablePropsSchema.parse({ ...base, showViewAll: true }).showViewAll).toBe(true);
	});

	it('keeps parsing a table that authors its own link through extraActions', () => {
		const parsed = resourceTablePropsSchema.parse({
			...base,
			linkRoutePath: 'iam_role',
			extraActions: [{ label: 'assignment.manageRoles', routePath: 'iam_role' }],
		});
		expect(parsed.showViewAll).toBe(false);
		expect(parsed.extraActions).toHaveLength(1);
	});

	it('rejects an unknown key', () => {
		expect(() => resourceTablePropsSchema.parse({ ...base, showViewAl: true })).toThrow();
	});
});
