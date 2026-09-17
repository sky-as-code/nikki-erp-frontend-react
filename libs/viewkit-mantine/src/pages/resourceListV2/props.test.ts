import { describe, expect, it } from 'vitest';

import { resourceListV2PropsSchema } from './props';


const base = { schemaName: 'iam_role', translationNs: 'iam', searchCommand: 'iam.role.search' };

describe('resourceListV2PropsSchema', () => {
	it('keeps the v1 defaults and adds a list-only view mode', () => {
		const parsed = resourceListV2PropsSchema.parse(base);
		expect(parsed.createEnabled).toBe(false);
		expect(parsed.extraActions).toEqual([]);
		expect(parsed.viewModes).toEqual([{ mode: 'list', label: 'datatable.list' }]);
		expect(parsed.updateCommand).toBeUndefined();
	});

	it('accepts an update command and custom view modes', () => {
		const parsed = resourceListV2PropsSchema.parse({
			...base,
			updateCommand: 'iam.role.update',
			viewModes: [{ mode: 'list', label: 'datatable.list' }, { mode: 'grid', label: 'datatable.grid' }],
		});
		expect(parsed.updateCommand).toBe('iam.role.update');
		expect(parsed.viewModes).toHaveLength(2);
	});

	it('rejects unknown keys and an empty view mode list', () => {
		expect(() => resourceListV2PropsSchema.parse({ ...base, archiveComand: 'x' })).toThrow();
		expect(() => resourceListV2PropsSchema.parse({ ...base, viewModes: [] })).toThrow();
	});
});
