import { describe, expect, it } from 'vitest';

import { diffRows, OPERATION_COLUMNS, pickVersion } from './bomStructureData';


describe('pickVersion', () => {
	it('prefers the newest draft, else the active version', () => {
		const versions = [
			{ id: 'v1', version_no: 1, status: 'active' },
			{ id: 'v2', version_no: 2, status: 'draft' },
			{ id: 'v3', version_no: 3, status: 'draft' },
		];
		expect(pickVersion(versions, 'v1')?.id).toBe('v3');
		expect(pickVersion(versions.slice(0, 1), 'v1')?.id).toBe('v1');
		expect(pickVersion([{ id: 'v1', status: 'obsolete' }], undefined)).toBeUndefined();
	});
});

describe('diffRows', () => {
	const original = [
		{ id: 'o1', etag: 'e1', sequence: 10, name: 'Mount PC', work_center_id: 'W1' },
		{ id: 'o2', etag: 'e2', sequence: 20, name: 'Test', work_center_id: 'W1' },
	];

	it('sends only deletes, changed fields and creates', () => {
		const edited = [
			{ id: 'o1', etag: 'e1', sequence: 10, name: 'Mount PC and screen', work_center_id: 'W1' },
			{ _key: 'new-0', sequence: 30, name: 'Pack', work_center_id: 'W2' },
		];
		expect(diffRows(original, edited, OPERATION_COLUMNS, 'V9')).toEqual([
			{ kind: 'delete', payload: { id: 'o2', etag: 'e2' } },
			{ kind: 'update', payload: { id: 'o1', etag: 'e1', name: 'Mount PC and screen' } },
			{
				kind: 'create',
				payload: {
					sequence: '30', name: 'Pack', work_center_id: 'W2', duration_expected: null, instructions: null,
					bom_version_id: 'V9',
				},
			},
		]);
	});

	it('sends nothing when nothing changed', () => {
		expect(diffRows(original, original.map(row => ({ ...row })), OPERATION_COLUMNS, 'V9')).toEqual([]);
	});
});
