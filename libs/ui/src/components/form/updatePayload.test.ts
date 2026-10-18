import { describe, expect, it } from 'vitest';

import { dirtyFieldUpdateValue, isClearedValue } from './updatePayload';


describe('dirtyFieldUpdateValue', () => {
	it('sends the parsed value of a field that has one', () => {
		expect(dirtyFieldUpdateValue({ name: 'A' }, { name: 'A' }, 'name')).toBe('A');
	});

	it('sends null for a field the user cleared', () => {
		expect(dirtyFieldUpdateValue({}, { owner_id: null }, 'owner_id')).toBeNull();
		expect(dirtyFieldUpdateValue({}, { note: '' }, 'note')).toBeNull();
		expect(dirtyFieldUpdateValue({}, { status: undefined }, 'status')).toBeNull();
	});

	it('leaves out a dirty field the parsed data lacks for another reason', () => {
		expect(dirtyFieldUpdateValue({}, { avatar: 'file.png' }, 'avatar')).toBeUndefined();
		expect(dirtyFieldUpdateValue({}, undefined, 'avatar')).toBeUndefined();
	});
});

describe('isClearedValue', () => {
	it('treats null, undefined, empty text and empty lists as cleared', () => {
		expect([null, undefined, '', []].every(isClearedValue)).toBe(true);
		expect([0, false, 'x', ['a']].some(isClearedValue)).toBe(false);
	});
});
