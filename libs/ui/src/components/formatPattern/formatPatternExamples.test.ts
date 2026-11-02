import { describe, expect, it } from 'vitest';

import { groupingExample, strftimeDirectiveExamples, strftimeExample } from './formatPatternExamples';


describe('format pattern examples', () => {
	const date = new Date(2026, 10, 1, 9, 30, 0);

	it('prints a strftime pattern for the date', () => {
		expect(strftimeExample('%d/%m/%Y', 'en-US', date)).toBe('01/11/2026');
		expect(strftimeExample('%T', 'en-US', date)).toBeNull();
	});

	it('groups the sample number', () => {
		expect(groupingExample('[3,0]', ',')).toBe('1,234,567');
		expect(groupingExample('[3,2,-1]', '.')).toBe('12.34.567');
		expect(groupingExample('[3', ',')).toBeNull();
	});

	it('lists every supported directive with what it prints', () => {
		const examples = strftimeDirectiveExamples('en-US', date);
		expect(examples.find(item => item.directive === '%Y')?.example).toBe('2026');
		expect(examples.find(item => item.directive === '%%')?.example).toBe('%');
	});
});
