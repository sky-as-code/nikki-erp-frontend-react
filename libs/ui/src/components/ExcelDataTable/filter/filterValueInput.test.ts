import { describe, expect, it } from 'vitest';

import { commitsOnKeystroke, isKeyboardCommitKind, shouldHideValueInput } from './FilterValueInput';


/**
 * A commit is what publishes a search, so "does typing commit?" is the whole question behind
 * the filter panel's rule: apply on Enter or the Apply button, never on a keystroke.
 */
describe('commitsOnKeystroke', () => {
	it('does not commit per keystroke by default', () => {
		// The default is the safe one on purpose. A caller that forgets the prop must not end up
		// firing a search per character — that regression is invisible until you watch the
		// network tab, so the default has to fail closed.
		expect(commitsOnKeystroke(undefined)).toBe(false);
	});

	it('waits for Enter when asked to', () => {
		expect(commitsOnKeystroke('enter')).toBe(false);
	});

	it('commits per keystroke only when explicitly opted into', () => {
		expect(commitsOnKeystroke('change')).toBe(true);
	});
});

describe('isKeyboardCommitKind', () => {
	it('treats select-backed kinds as having no keystroke to confirm', () => {
		// These render a Select, whose change *is* the choice; routing them through the panel's
		// Enter path would apply a filter the user never confirmed.
		expect(isKeyboardCommitKind('boolean')).toBe(false);
		expect(isKeyboardCommitKind('enum')).toBe(false);
	});

	it('treats every free-text kind as Enter-committable', () => {
		// `langText` is the one that a hardcoded kind list forgets; it is a text box like the
		// others and must accept Enter.
		expect(isKeyboardCommitKind('text')).toBe(true);
		expect(isKeyboardCommitKind('langText')).toBe(true);
		expect(isKeyboardCommitKind('number')).toBe(true);
		expect(isKeyboardCommitKind('date')).toBe(true);
	});
});

describe('shouldHideValueInput', () => {
	it('hides the box for operators that take no operand', () => {
		expect(shouldHideValueInput('is_set')).toBe(true);
		expect(shouldHideValueInput('not_set')).toBe(true);
		expect(shouldHideValueInput('=')).toBe(false);
	});
});
