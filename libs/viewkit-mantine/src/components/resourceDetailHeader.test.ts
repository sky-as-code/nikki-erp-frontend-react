import { defineComponent } from '@nikkierp/viewengine/metadata';
import { describe, expect, it } from 'vitest';

import { buildPartialSavePayload, collectColumnFields } from './resourceDetailHeader';
import { COLLAPSIBLE_SECTION, RESOURCE_FORM_COLUMN, RESOURCE_FORM_TABS, RESOURCE_TABLE } from '../ids';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const column = (fields: string[]): ComponentNode => defineComponent({
	component: RESOURCE_FORM_COLUMN,
	props: { fields },
});

const section = (children: ComponentNode[]): ComponentNode => defineComponent({
	component: COLLAPSIBLE_SECTION,
	props: { layout: 'formBlocks' },
	children,
});

/**
 * These two decide what a Save actually PATCHes. The allowlist used to come from `formSections`;
 * it is now derived from the page's node tree, and nothing else asserts that derivation.
 */
describe('resource detail save scoping', () => {
	describe('collectColumnFields', () => {
		/**
		 * Columns live inside `collapsible_section`s, so a shallow scan of the top-level nodes
		 * would find none of them and every save would send `{id, etag}` alone.
		 */
		it('finds columns nested inside sections', () => {
			const blocks = collectColumnFields([section([column(['code', 'name'])])]);

			expect(blocks).toEqual([{ fields: ['code', 'name'] }]);
		});

		it('finds columns at any depth, in document order', () => {
			const nodes = [
				section([column(['a']), column(['b'])]),
				defineComponent({
					component: RESOURCE_FORM_TABS,
					children: [section([column(['c'])])],
				}),
			];

			expect(collectColumnFields(nodes).flatMap(block => block.fields ?? []))
				.toEqual(['a', 'b', 'c']);
		});

		/**
		 * A related-records table registers nothing on this form, so it must contribute no fields
		 * — otherwise Save would try to PATCH the other resource's columns onto this record.
		 */
		it('ignores nodes that are not form columns', () => {
			const nodes = [section([defineComponent({
				component: RESOURCE_TABLE,
				props: { fields: ['not_mine'] },
			})])];

			expect(collectColumnFields(nodes)).toEqual([]);
		});

		it('tolerates a column with no fields', () => {
			expect(collectColumnFields([section([defineComponent({
				component: RESOURCE_FORM_COLUMN,
			})])])).toEqual([{}]);
		});
	});

	describe('buildPartialSavePayload', () => {
		const resource = { id: 'r1', etag: 'e1' };
		const blocks = [{ fields: ['code', 'name'] }];

		it('sends only the dirty fields, plus id and etag', () => {
			const payload = buildPartialSavePayload(
				{ code: 'C2', name: 'N2' }, blocks, { code: true }, resource,
			);

			expect(payload).toEqual({ id: 'r1', etag: 'e1', code: 'C2' });
		});

		/**
		 * `{id, etag}` alone is a write that stores nothing yet reports success — indistinguishable
		 * to the user from a save that worked.
		 */
		it('returns undefined when nothing in scope changed', () => {
			expect(buildPartialSavePayload({ code: 'C' }, blocks, {}, resource)).toBeUndefined();
		});

		/** A dirty field no column declares is not ours to write. */
		it('drops dirty fields outside the collected columns', () => {
			const payload = buildPartialSavePayload(
				{ code: 'C2', stray: 'x' }, blocks, { code: true, stray: true }, resource,
			);

			expect(payload).toEqual({ id: 'r1', etag: 'e1', code: 'C2' });
		});

		/** Without an etag the server cannot check the optimistic lock, so there is nothing to send. */
		it('refuses to build a payload with no id or etag', () => {
			expect(buildPartialSavePayload({ code: 'C' }, blocks, { code: true }, {})).toBeUndefined();
		});
	});
});
