import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import { isRecordNotFound } from './loadErrors';


function item(key: string): ClientErrorItem {
	return new ClientErrorItem({ key, message: 'x', type: 'business' });
}

describe('isRecordNotFound', () => {
	it('detects a not-found refusal whatever its namespace', () => {
		expect(isRecordNotFound([item('common:err_not_found')])).toBe(true);
		expect(isRecordNotFound([item('common:err_x'), item('iam:err_not_found')])).toBe(true);
	});

	it('is false for other refusals and for no errors', () => {
		expect(isRecordNotFound([item('common:resource_in_use')])).toBe(false);
		expect(isRecordNotFound([])).toBe(false);
	});
});
