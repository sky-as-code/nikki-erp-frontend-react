import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	assignmentSearchField, buildAssignPayload, buildRemovePayload, commandFailureMessage, pickedRecordId,
} from './assignmentPayloads';


function clientError(key: string, message: string, field?: string): ClientErrorItem {
	return new ClientErrorItem({ key, message, field, type: 'business' });
}

describe('buildAssignPayload', () => {
	it('adds the picked record to the page record', () => {
		expect(buildAssignPayload('R1', 'U1')).toEqual({ id: 'R1', add: ['U1'] });
	});
});

describe('buildRemovePayload', () => {
	it('removes every selected row in one request, once each', () => {
		expect(buildRemovePayload('R1', [{ id: 'U1' }, { id: 'U2' }, { id: 'U1' }]))
			.toEqual({ id: 'R1', remove: ['U1', 'U2'] });
	});

	it('skips rows without an id', () => {
		expect(buildRemovePayload('R1', [{ id: '' }, { name: 'x' }, { id: 7 }])).toEqual({ id: 'R1', remove: ['7'] });
	});
});

describe('commandFailureMessage', () => {
	it('is null on success', () => {
		expect(commandFailureMessage({ result: { data: {}, clientErrors: [] }, error: null, data: {} })).toBeNull();
	});

	it('reads a technical failure', () => {
		expect(commandFailureMessage({ result: null, error: new Error('Network down'), data: null }))
			.toBe('Network down');
	});

	it('joins client errors, naming the field when there is one', () => {
		const errors = [clientError('err_a', 'Role is a system role'), clientError('err_b', '', 'add')];
		expect(commandFailureMessage({ result: { data: null, clientErrors: errors }, error: null, data: null }))
			.toBe('Role is a system role; add: err_b');
	});
});

describe('assignmentSearchField', () => {
	it('prefers the declared column, then the first field, then id', () => {
		expect(assignmentSearchField('display_name', ['avatar_url', 'display_name'])).toBe('display_name');
		expect(assignmentSearchField(undefined, ['name'])).toBe('name');
		expect(assignmentSearchField(undefined, [])).toBe('id');
		expect(assignmentSearchField(undefined, undefined)).toBe('id');
	});
});

describe('pickedRecordId', () => {
	it('reads the id the picker wrote into its column', () => {
		expect(pickedRecordId({ display_name: 'U1' }, 'display_name')).toBe('U1');
	});

	it('is null when nothing was picked', () => {
		expect(pickedRecordId({ display_name: '' }, 'display_name')).toBeNull();
		expect(pickedRecordId({}, 'display_name')).toBeNull();
		expect(pickedRecordId({ display_name: 7 }, 'display_name')).toBeNull();
	});
});
