import { describe, expect, it } from 'vitest';

import { resourceDetailV2PropsSchema } from './props';


const base = { schemaName: 'iam_role', translationNs: 'iam' };

describe('resourceDetailV2PropsSchema', () => {
	it('defaults to no related resources and keeps the v1 defaults', () => {
		const parsed = resourceDetailV2PropsSchema.parse(base);
		expect(parsed.relatedResources).toEqual([]);
		expect(parsed.standardActionCommands).toEqual({});
	});

	it('places the status flow in the toolbar unless the page names its first section', () => {
		expect(resourceDetailV2PropsSchema.parse(base).statusPlacement).toBe('toolbar');
		expect(resourceDetailV2PropsSchema.parse({ ...base, statusPlacement: 'firstSection' }).statusPlacement)
			.toBe('firstSection');
		expect(() => resourceDetailV2PropsSchema.parse({ ...base, statusPlacement: 'header' })).toThrow();
	});

	it('accepts create defaults', () => {
		const parsed = resourceDetailV2PropsSchema.parse({ ...base, createDefaults: { type: 'service' } });
		expect(parsed.createDefaults).toEqual({ type: 'service' });
	});

	it('accepts related resources with the embedded table props and a label', () => {
		const parsed = resourceDetailV2PropsSchema.parse({
			...base,
			relatedResources: [{
				label: 'role_sections_assignedUsers', schemaName: 'iam_user', translationNs: 'iam',
				searchCommand: 'iam.user.search', initialGraph: { if: ['roles', 'linked', '${id}'] }, linkRoutePath: 'iam_user',
			}],
		});
		expect(parsed.relatedResources[0].pageSize).toBe(20);
		expect(parsed.relatedResources[0].extraActions).toEqual([]);
	});

	it('accepts a filtered, relabelled "View all" on a related resource', () => {
		const parsed = resourceDetailV2PropsSchema.parse({
			...base,
			relatedResources: [{
				label: 'tab', schemaName: 'iam_user', translationNs: 'iam', searchCommand: 'iam.user.search',
				linkRoutePath: 'iam_user', showViewAll: true, viewAllFiltered: true, viewAllLabel: 'role_viewUsers',
			}],
		});
		expect(parsed.relatedResources[0]).toMatchObject({ viewAllFiltered: true, viewAllLabel: 'role_viewUsers' });
	});

	it('rejects a related resource without a label or with unknown keys', () => {
		expect(() => resourceDetailV2PropsSchema.parse({
			...base, relatedResources: [{ schemaName: 'iam_user', translationNs: 'iam', searchCommand: 'c' }],
		})).toThrow();
		expect(() => resourceDetailV2PropsSchema.parse({ ...base, relatedResource: [] })).toThrow();
	});

	it('accepts an assignment spec and a section notice', () => {
		const parsed = resourceDetailV2PropsSchema.parse({
			...base,
			relatedResourcesNotice: 'role_relatedNotice',
			relatedResources: [{
				label: 'role_sections_assignedUsers', schemaName: 'iam_user', translationNs: 'iam', searchCommand: 'c',
				assignment: {
					pickerSchemaName: 'iam_user', manageCommand: 'iam.iam_role.manage_role_users',
					actionCode: 'manage_role_assignments',
				},
			}],
		});
		expect(parsed.relatedResourcesNotice).toBe('role_relatedNotice');
		expect(parsed.relatedResources[0].assignment?.actionResource).toBeUndefined();
	});

	it('rejects an assignment missing its command or carrying unknown keys', () => {
		const tab = { label: 'l', schemaName: 'iam_user', translationNs: 'iam', searchCommand: 'c' };
		const assignment = { pickerSchemaName: 'iam_user', manageCommand: 'm', actionCode: 'a' };
		expect(() => resourceDetailV2PropsSchema.parse({
			...base, relatedResources: [{ ...tab, assignment: { ...assignment, manageCommand: undefined } }],
		})).toThrow();
		expect(() => resourceDetailV2PropsSchema.parse({
			...base, relatedResources: [{ ...tab, assignment: { ...assignment, extra: true } }],
		})).toThrow();
	});
});

describe('relatedAssignmentSchema btnDeleteLabel', () => {
	it('keeps the row delete label of an assignment and rejects an empty one', () => {
		const tab = { label: 'l', schemaName: 'iam_user', translationNs: 'iam', searchCommand: 'c' };
		const assignment = { pickerSchemaName: 'iam_user', manageCommand: 'm', actionCode: 'a' };
		const parsed = resourceDetailV2PropsSchema.parse({
			...base, relatedResources: [{ ...tab, assignment: { ...assignment, btnDeleteLabel: 'iam:role_remove' } }],
		});
		expect(parsed.relatedResources[0].assignment?.btnDeleteLabel).toBe('iam:role_remove');
		expect(() => resourceDetailV2PropsSchema.parse({
			...base, relatedResources: [{ ...tab, assignment: { ...assignment, btnDeleteLabel: '' } }],
		})).toThrow();
	});
});
