import { describe, expect, it } from 'vitest';

import {
	actionColumnKey, buildTableColumns, findActionColumnConfigErrors, getActionColumnWidth, withActionColumnWidths,
} from './actionColumns/actionColumnsModel';
import { mergeFieldEditors } from './capabilities';
import { idsAddedSince, rowChangeMark } from './changeIndicator/changeIndicator';
import { getColumnCount, getTableMinWidth, rowNumberColumnWidth, sortHandleColumnWidth } from './columnWidths';
import { manualSortLock, reorderRowIds, searchGraphKey } from './manualSort/manualSortModel';
import { fieldsToWrite, isTextEntryElement, sentValueKey } from './updateScope/tableScopeModel';

import type { ActionColumn, NewRowFieldEditor } from './types';


describe('manualSortLock', () => {
	const free = { canUpdate: true, updateLocked: false, isEditing: false, isSortedOrFiltered: false };

	it('lets rows be dragged only when nothing stands in the way', () => {
		expect(manualSortLock(free)).toBeNull();
	});

	it('names the first obstacle', () => {
		expect(manualSortLock({ ...free, canUpdate: false, isEditing: true })).toBe('readOnly');
		expect(manualSortLock({ ...free, updateLocked: true })).toBe('permission');
		expect(manualSortLock({ ...free, isEditing: true, isSortedOrFiltered: true })).toBe('editing');
		expect(manualSortLock({ ...free, isSortedOrFiltered: true })).toBe('filtered');
	});
});

describe('reorderRowIds', () => {
	it('moves the dragged row into the slot it was dropped on', () => {
		expect(reorderRowIds(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
		expect(reorderRowIds(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
	});

	it('reports ids as strings', () => {
		expect(reorderRowIds([1, 2], 2, 1)).toEqual(['2', '1']);
	});

	it('is null when nothing moved', () => {
		expect(reorderRowIds(['a', 'b'], 'a', 'a')).toBeNull();
		expect(reorderRowIds(['a', 'b'], 'a', null)).toBeNull();
		expect(reorderRowIds(['a', 'b'], 'a', 'z')).toBeNull();
	});
});

describe('searchGraphKey', () => {
	it('treats an absent and an empty graph alike', () => {
		expect(searchGraphKey(undefined)).toBe(searchGraphKey({}));
		expect(searchGraphKey({ order: [['name', 'asc']] })).not.toBe('');
	});
});

const configure: ActionColumn = {
	key: 'configure', afterField: 'name', actions: [{ key: 'go', label: 'Configure', type: 'action_link', href: () => '' }],
};
const tail: ActionColumn = { key: 'tail', actions: [{ key: 'run', label: 'Run', type: 'action', command: 'x.run' }] };

describe('buildTableColumns', () => {
	it('places a column after its field, and one without afterField last', () => {
		const keys = buildTableColumns(['name', 'kind'], [tail, configure]).map(column => column.key);
		expect(keys).toEqual(['name', actionColumnKey('configure'), 'kind', actionColumnKey('tail')]);
	});

	it('puts a column whose afterField is not displayed last', () => {
		const keys = buildTableColumns(['kind'], [configure]).map(column => column.key);
		expect(keys).toEqual(['kind', actionColumnKey('configure')]);
	});

	it('is the fields alone without action columns', () => {
		expect(buildTableColumns(['name'], undefined)).toEqual([{ kind: 'field', key: 'name', field: 'name' }]);
	});
});

describe('action column widths', () => {
	it('estimates from the labels, and keeps a declared width', () => {
		expect(getActionColumnWidth(configure)).toBeGreaterThan(64);
		expect(getActionColumnWidth({ ...configure, width: 90 })).toBe(90);
	});

	it('lets a resized width win over the estimate', () => {
		const columns = buildTableColumns(['name'], [configure]);
		const key = actionColumnKey('configure');
		expect(withActionColumnWidths(columns, {})[key]).toBe(getActionColumnWidth(configure));
		expect(withActionColumnWidths(columns, { [key]: 300 })[key]).toBe(300);
	});
});

describe('findActionColumnConfigErrors', () => {
	it('reports a missing command or href and a duplicate key', () => {
		const errors = findActionColumnConfigErrors([
			{ key: 'a', actions: [{ key: 'x', label: 'X', type: 'action' }, { key: 'y', label: 'Y', type: 'link' }] },
			{ key: 'a', actions: [] },
		]);
		expect(errors).toHaveLength(3);
	});

	it('accepts a complete configuration', () => {
		expect(findActionColumnConfigErrors([configure, tail])).toEqual([]);
	});
});

describe('table layout with a sort handle and a badged index', () => {
	it('counts and sizes the handle column', () => {
		const layout = { indexColumnVisible: true, fillerMinWidth: 0, sortHandleVisible: true };
		expect(getColumnCount(2, layout)).toBe(5);
		expect(getTableMinWidth(['name'], { name: 100 }, layout)).toBe(rowNumberColumnWidth + sortHandleColumnWidth + 100);
		expect(getTableMinWidth(['name'], { name: 100 }, { ...layout, indexColumnWidth: 112 }))
			.toBe(112 + sortHandleColumnWidth + 100);
	});
});

describe('mergeFieldEditors', () => {
	const shared: NewRowFieldEditor = () => null;
	const specific: NewRowFieldEditor = () => null;

	it('lets the specific map win per field', () => {
		expect(mergeFieldEditors({ a: shared, b: shared }, { b: specific })).toEqual({ a: shared, b: specific });
	});

	it('returns either map unchanged when the other is absent', () => {
		const map = { a: shared };
		expect(mergeFieldEditors(map, undefined)).toBe(map);
		expect(mergeFieldEditors(undefined, map)).toBe(map);
		expect(mergeFieldEditors(undefined, undefined)).toEqual({});
	});
});

describe('rowChangeMark', () => {
	const tracked = { created: new Set(['n1']), updated: new Set(['a', 'n1']) };

	it('marks created rows new, even once edited, and updated rows changed', () => {
		expect(rowChangeMark({ id: 'n1' }, 'n1', tracked)).toBe('new');
		expect(rowChangeMark({ id: 'a' }, 'a', tracked)).toBe('changed');
		expect(rowChangeMark({ id: 'b' }, 'b', tracked)).toBeNull();
	});

	it('takes the host marks too', () => {
		const empty = { created: new Set<string>(), updated: new Set<string>() };
		expect(rowChangeMark({ id: 'b', draft: true }, 'b', empty, row => Boolean(row.draft))).toBe('new');
		expect(rowChangeMark({ id: 'b' }, 'b', empty, undefined, () => true)).toBe('changed');
	});
});

describe('idsAddedSince', () => {
	it('lists the displayed ids a create added', () => {
		expect(idsAddedSince(new Set(['a', 'b']), [{ id: 'a' }, { id: 'n1' }, { id: 'b' }])).toEqual(['n1']);
	});
});

describe('isTextEntryElement', () => {
	it('is true for typed inputs and textareas', () => {
		expect(isTextEntryElement({ tagName: 'INPUT', type: 'text' })).toBe(true);
		expect(isTextEntryElement({ tagName: 'INPUT', type: '' })).toBe(true);
		expect(isTextEntryElement({ tagName: 'TEXTAREA' })).toBe(true);
	});

	it('is false for pick-only controls', () => {
		expect(isTextEntryElement({ tagName: 'INPUT', type: 'text', readOnly: true })).toBe(false);
		expect(isTextEntryElement({ tagName: 'INPUT', type: 'checkbox' })).toBe(false);
		expect(isTextEntryElement({ tagName: 'BUTTON' })).toBe(false);
		expect(isTextEntryElement(null)).toBe(false);
	});
});

describe('fieldsToWrite', () => {
	it('takes dirty fields not already written with their current value', () => {
		const values: Record<string, unknown> = { name: 'A', kind: 'x', code: 'c' };
		const sent = new Map([['name', sentValueKey('A')], ['kind', sentValueKey('old')]]);
		const dirty = (field: string) => field !== 'code';
		expect(fieldsToWrite(['name', 'kind', 'code'], dirty, field => values[field], sent)).toEqual(['kind']);
	});
});
