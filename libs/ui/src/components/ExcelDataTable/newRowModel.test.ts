import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	buildContainsSearchRequest, buildNewRowPayload, findNewRowConfigProblems, isEmptyNewRowValue,
	resolveNewRowColumns, splitNewRowErrors,
} from './newRowModel';

import type { NewRowConfig } from './context';
import type * as dyn from '@nikkierp/common/dynamicModel';


const schema = {
	name: 'iam_entitlement',
	fields: {
		id: { name: 'id', data_type: { name: 'ulid' }, is_primary_key: true },
		name: { name: 'name', data_type: { name: 'string' }, is_required_for_create: true },
		code: { name: 'code', data_type: { name: 'string' }, no_update: true },
		description: { name: 'description', data_type: { name: 'string' } },
		created_at: { name: 'created_at', data_type: { name: 'nikkiDateTime' }, is_auto_generated: true },
	},
} as unknown as dyn.ModelSchema;

const editor = () => null;

function config(overrides: Partial<NewRowConfig> = {}): NewRowConfig {
	return {
		source: 'user-input',
		resourceSchema: undefined,
		searchField: undefined,
		searchCommand: undefined,
		prompt: undefined,
		fieldEditors: {},
		...overrides,
	};
}

describe('resolveNewRowColumns', () => {
	it('gives creatable columns an AutoField and editor columns their editor, in display order', () => {
		const columns = resolveNewRowColumns(
			schema, ['id', 'resource_id', 'name', 'code', 'created_at', 'description'],
			config({ fieldEditors: { resource_id: editor } }),
		);
		expect(columns.editable).toEqual(['resource_id', 'name', 'code', 'description']);
		expect(columns.autoFields).toEqual(['name', 'code', 'description']);
		expect(columns.editorFields).toEqual(['resource_id']);
		expect(columns.searchField).toBeUndefined();
	});

	it('gives a server-resource row its search column only', () => {
		const columns = resolveNewRowColumns(
			schema, ['id', 'name'], config({ source: 'server-resource', searchField: 'id', resourceSchema: 'iam_user' }),
		);
		expect(columns).toEqual({ autoFields: [], editorFields: [], searchField: 'id', editable: ['id'] });
	});

	it('gives a server-resource row no input when its search column is not displayed', () => {
		const columns = resolveNewRowColumns(schema, ['name'], config({ source: 'server-resource', searchField: 'id' }));
		expect(columns.editable).toEqual([]);
	});
});

describe('isEmptyNewRowValue', () => {
	it('treats absent, blank and empty containers as empty', () => {
		for (const value of [undefined, null, '', '  ', [], {}]) {
			expect(isEmptyNewRowValue(value)).toBe(true);
		}
	});

	it('keeps zero, false, text and filled containers', () => {
		for (const value of [0, false, 'x', ['a'], { 'en-US': 'x' }, new Date()]) {
			expect(isEmptyNewRowValue(value)).toBe(false);
		}
	});
});

describe('buildNewRowPayload', () => {
	const columns = resolveNewRowColumns(
		schema, ['action_id', 'name', 'code', 'description'], config({ fieldEditors: { action_id: editor } }),
	);

	it('drops empty optional fields and keeps required and editor values as given', () => {
		const payload = buildNewRowPayload(
			{ action_id: null, name: '', code: 'C1', description: '', stray: 'x' }, columns, schema,
		);
		expect(payload).toEqual({ action_id: null, name: '', code: 'C1' });
	});

	it('leaves out an editor value never set', () => {
		expect(buildNewRowPayload({ name: 'N' }, columns, schema)).toEqual({ name: 'N' });
	});

	it('sends the picked record of a server-resource row, and nothing before a pick', () => {
		const searchColumns = resolveNewRowColumns(schema, ['id'], config({ source: 'server-resource', searchField: 'id' }));
		expect(buildNewRowPayload({ id: '01U' }, searchColumns, schema)).toEqual({ id: '01U' });
		expect(buildNewRowPayload({}, searchColumns, schema)).toEqual({});
	});
});

describe('splitNewRowErrors', () => {
	it('attaches errors of fields the row has inputs for and keeps the rest', () => {
		const onName = new ClientErrorItem({ key: 'required', message: 'Required', type: 'validation', field: 'name' });
		const onRole = new ClientErrorItem({ key: 'required', message: 'Required', type: 'validation', field: 'role_id' });
		const anonymous = new ClientErrorItem({ key: 'forbidden', message: 'Forbidden', type: 'authorization' });
		const split = splitNewRowErrors([onName, onRole, anonymous], ['name']);
		// Compared by identity: the items keep their state in private fields, invisible to `toEqual`.
		expect(split.attached).toHaveLength(1);
		expect(split.attached[0]).toBe(onName);
		expect(split.unattached).toHaveLength(2);
		expect(split.unattached[0]).toBe(onRole);
		expect(split.unattached[1]).toBe(anonymous);
	});
});

describe('findNewRowConfigProblems', () => {
	it('accepts a consistent configuration', () => {
		expect(findNewRowConfigProblems(schema, ['name'], config({ fieldEditors: { name: editor } }))).toEqual([]);
	});

	it('reports a missing schema, editors of hidden columns and a hidden search column', () => {
		expect(findNewRowConfigProblems(undefined, ['name'], config())).toHaveLength(1);
		expect(findNewRowConfigProblems(schema, ['name'], config({ fieldEditors: { code: editor } }))).toEqual([
			`newRowFieldEditors['code'] is not a displayed column`,
		]);
		const problems = findNewRowConfigProblems(
			schema, ['name'], config({ source: 'server-resource', searchField: 'id', fieldEditors: { name: editor } }),
		);
		expect(problems).toHaveLength(2);
	});
});

describe('buildContainsSearchRequest', () => {
	it('searches the label with contains and asks for the label columns once', () => {
		expect(buildContainsSearchRequest(' adm ', 'name', 'code')).toEqual({
			page: 0, size: 10, fields: ['id', 'name', 'code'], graph: { if: ['name', '*', 'adm'] },
		});
	});

	it('sends no condition for a blank term or an id label', () => {
		expect(buildContainsSearchRequest('', 'name').graph).toBeUndefined();
		expect(buildContainsSearchRequest('01H', 'id')).toEqual({ page: 0, size: 10, fields: ['id'], graph: undefined });
	});
});
