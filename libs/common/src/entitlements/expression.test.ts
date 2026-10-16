import { describe, expect, it } from 'vitest';

import { toDisplayedEntitlements } from './expression';


describe('toDisplayedEntitlements', () => {
	it('drops the scope id', () => {
		expect(toDisplayedEntitlements(['create:iam_user:org/ORG1'])).toEqual(['create:iam_user:org']);
	});

	it('collapses the same code across orgs, keeping first-seen order', () => {
		expect(toDisplayedEntitlements([
			'delete:iam_user:org/ORG1', 'create:iam_user:tenant', 'delete:iam_user:org/ORG2',
		])).toEqual(['delete:iam_user:org', 'create:iam_user:tenant']);
	});

	it('keeps a malformed string verbatim', () => {
		expect(toDisplayedEntitlements(['not an expression'])).toEqual(['not an expression']);
	});
});
