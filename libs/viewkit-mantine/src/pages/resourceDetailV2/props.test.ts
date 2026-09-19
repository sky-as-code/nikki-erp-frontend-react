import { describe, expect, it } from 'vitest';

import { resourceDetailV2PropsSchema } from './props';


const base = { schemaName: 'iam_role', translationNs: 'iam' };

describe('resourceDetailV2PropsSchema', () => {
	it('defaults to no related resources and keeps the v1 defaults', () => {
		const parsed = resourceDetailV2PropsSchema.parse(base);
		expect(parsed.relatedResources).toEqual([]);
		expect(parsed.standardActionCommands).toEqual({});
	});

	it('accepts related resources with the embedded table props and a label', () => {
		const parsed = resourceDetailV2PropsSchema.parse({
			...base,
			relatedResources: [{
				label: 'role_sections_assignedUsers', schemaName: 'iam_user', translationNs: 'iam',
				searchCommand: 'iam.user.search', filterGraph: { if: ['roles', 'linked', '${id}'] }, linkRoutePath: 'iam_user',
			}],
		});
		expect(parsed.relatedResources[0].pageSize).toBe(20);
		expect(parsed.relatedResources[0].extraActions).toEqual([]);
	});

	it('rejects a related resource without a label or with unknown keys', () => {
		expect(() => resourceDetailV2PropsSchema.parse({
			...base, relatedResources: [{ schemaName: 'iam_user', translationNs: 'iam', searchCommand: 'c' }],
		})).toThrow();
		expect(() => resourceDetailV2PropsSchema.parse({ ...base, relatedResource: [] })).toThrow();
	});
});
