import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	buildAssignPayload, buildRemovePayload, commandFailureMessage, searchFailureMessage,
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

describe('searchFailureMessage', () => {
	it('prefers the technical error, then the refusal, else null', () => {
		expect(searchFailureMessage('boom', [clientError('k', 'denied')])).toBe('boom');
		expect(searchFailureMessage(undefined, [clientError('k', 'denied')])).toBe('denied');
		expect(searchFailureMessage(undefined, [])).toBeNull();
	});
});
