import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	buildRowDeletePayload, deletableRowId, isRowDeleteDisabled, isRowDeleteShown, isRowEditShown, rowDeleteOutcome,
} from './rowDeleteModel';


function clientError(type: string, message = '') {
	return new ClientErrorItem({ key: `err_${type}`, message, type: type as 'validation' });
}

describe('buildRowDeletePayload', () => {
	it('names the one row by its id', () => {
		expect(buildRowDeletePayload('r1')).toEqual({ ids: ['r1'] });
	});
});

describe('deletableRowId', () => {
	it('reads a string or numeric record id', () => {
		expect(deletableRowId({ id: 'r1' })).toBe('r1');
		expect(deletableRowId({ id: 7 })).toBe(7);
	});

	it('has no id for a row without one', () => {
		expect(deletableRowId({ name: 'x' })).toBeUndefined();
	});
});

describe('rowDeleteOutcome', () => {
	it('is deleted when neither an error nor client errors came back', () => {
		expect(rowDeleteOutcome({ result: { data: null, clientErrors: [] }, error: null, data: null }))
			.toEqual({ status: 'deleted' });
	});

	it('leaves a permission refusal to the locked-feature modal', () => {
		const response = { result: { data: null, clientErrors: [clientError('authorization')] }, error: null, data: null };
		expect(rowDeleteOutcome(response)).toEqual({ status: 'explained' });
	});

	it('reports business errors by message, falling back to the key', () => {
		const errors = [clientError('business', 'In use'), clientError('validation')];
		const response = { result: { data: null, clientErrors: errors }, error: null, data: null };
		expect(rowDeleteOutcome(response)).toEqual({ status: 'failed', messages: ['In use', 'err_validation'] });
	});

	it('reports a technical error by its message', () => {
		expect(rowDeleteOutcome({ result: null, error: new Error('Network down'), data: null }))
			.toEqual({ status: 'failed', messages: ['Network down'] });
	});

	it('still fails, with nothing to say, on a non-Error technical failure', () => {
		expect(rowDeleteOutcome({ result: null, error: 'boom', data: null })).toEqual({ status: 'failed', messages: [] });
	});
});

describe('row delete gating', () => {
	it('is shown only with the delete capability', () => {
		expect(isRowDeleteShown(['delete'])).toBe(true);
		expect(isRowDeleteShown(['update', 'create'])).toBe(false);
	});

	it('is disabled while editing, loading or deleting', () => {
		const idle = { isEditing: false, isLoading: false, isDeleting: false };
		expect(isRowDeleteDisabled(idle)).toBe(false);
		expect(isRowDeleteDisabled({ ...idle, isEditing: true })).toBe(true);
		expect(isRowDeleteDisabled({ ...idle, isLoading: true })).toBe(true);
		expect(isRowDeleteDisabled({ ...idle, isDeleting: true })).toBe(true);
	});
});

describe('isRowEditShown', () => {
	it('offers Edit only to a table that may update rows', () => {
		expect(isRowEditShown(['update'])).toBe(true);
		expect(isRowEditShown(['create', 'delete'])).toBe(false);
	});
});
