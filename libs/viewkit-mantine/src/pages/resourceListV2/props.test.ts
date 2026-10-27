import { describe, expect, it } from 'vitest';

import { defaultListViewMode, resourceListV2PropsSchema } from './props';
import { EXCEL_DATA_TABLE_BODY } from '../../ids';


const base = { schemaName: 'iam_role', translationNs: 'iam', searchCommand: 'iam.role.search' };

describe('resourceListV2PropsSchema', () => {
	it('keeps the v1 defaults and adds a list-only view mode', () => {
		const parsed = resourceListV2PropsSchema.parse(base);
		expect(parsed.createEnabled).toBe(false);
		expect(parsed.extraActions).toEqual([]);
		expect(parsed.viewModes).toEqual([{
			mode: 'list',
			label: 'datatable.list',
			// The default mode names the table body rather than the template drawing it directly,
			// which is what lets a page put something else in that slot.
			viewkitComponent: { type: 'component', component: EXCEL_DATA_TABLE_BODY, props: {} },
		}]);
		expect(parsed.updateCommand).toBeUndefined();
	});

	// Each call gets its own copy, so a factory that mutates what it is handed cannot reach the
	// next page that asks for the defaults.
	it('hands out a fresh default mode each time', () => {
		const first = defaultListViewMode();
		first.label = 'mutated';
		expect(defaultListViewMode().label).toBe('datatable.list');
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

	it('accepts a static graph beside the editable initial graph', () => {
		const parsed = resourceListV2PropsSchema.parse({
			...base, staticGraph: { if: ['type', '=', 'user'] }, initialGraph: { if: ['status', '=', 'active'] },
		});
		expect(parsed.staticGraph).toEqual({ if: ['type', '=', 'user'] });
	});

	it('rejects unknown keys and an empty view mode list', () => {
		expect(() => resourceListV2PropsSchema.parse({ ...base, archiveComand: 'x' })).toThrow();
		expect(() => resourceListV2PropsSchema.parse({ ...base, viewModes: [] })).toThrow();
	});
});
