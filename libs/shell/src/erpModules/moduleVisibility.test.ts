import { describe, expect, it } from 'vitest';

import { isListedModule } from './moduleVisibility';


describe('isListedModule', () => {
	it('lists a module that ships a UI', () => {
		expect(isListedModule({ has_ui: true, is_orphaned: false })).toBe(true);
	});

	it('hides a module without a UI, even when orphans are shown', () => {
		expect(isListedModule({ has_ui: false, is_orphaned: false })).toBe(false);
		expect(isListedModule({ has_ui: false, is_orphaned: true }, true)).toBe(false);
	});

	it('hides an orphaned module unless orphans are shown', () => {
		expect(isListedModule({ has_ui: true, is_orphaned: true })).toBe(false);
		expect(isListedModule({ has_ui: true, is_orphaned: true }, true)).toBe(true);
	});
});
