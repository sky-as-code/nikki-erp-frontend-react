// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { lockedFieldHint } from './ownPropertiesBlock';


describe('lockedFieldHint', () => {
	const byFlag = { mode: { unless: 'can_change_mode', hint: 'mode_locked' } };
	const byCondition = { code: { when: { field: 'first_issued_at', operator: 'exists' as const }, hint: 'issued' } };

	it('locks on a false flag in update mode only', () => {
		expect(lockedFieldHint(byFlag, 'mode', 'update', { can_change_mode: false })).toBe('mode_locked');
		expect(lockedFieldHint(byFlag, 'mode', 'update', { can_change_mode: true })).toBeUndefined();
		expect(lockedFieldHint(byFlag, 'mode', 'create', { can_change_mode: false })).toBeUndefined();
	});

	it('locks while the record matches the condition', () => {
		expect(lockedFieldHint(byCondition, 'code', 'update', { first_issued_at: '2026-11-04T00:00:00Z' })).toBe('issued');
		expect(lockedFieldHint(byCondition, 'code', 'update', { first_issued_at: null })).toBeUndefined();
		expect(lockedFieldHint(byCondition, 'name', 'update', { first_issued_at: '2026-11-04T00:00:00Z' }))
			.toBeUndefined();
	});
});
