import { findUngatedActions } from '@nikkierp/viewkit-mantine/actionCodes';
import { RESOURCE_DETAIL_V2_TEMPLATE, RESOURCE_LIST_V2_TEMPLATE } from '@nikkierp/viewkit-mantine/ids';
import { describe, expect, it } from 'vitest';

import { buildCurrencyPages } from './currency';
import { buildSequencePages } from './sequence';
import { buildUomPages } from './uom';
import { buildUomCatPages } from './uomcat';
import { SequenceCounterCommands, SequenceDefinitionCommands } from '../features/sequence/commands';

import type { ComponentNode, PageNode, TemplateRef } from '@nikkierp/viewengine/metadata';
import type { RelatedResource } from '@nikkierp/viewkit-mantine/props';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'uom', build: buildUomPages },
	{ name: 'uomcat', build: buildUomCatPages },
	{ name: 'currency', build: buildCurrencyPages },
];

/** The issuance list is a flat page on purpose, so it is checked apart from the split views. */
const allBuilders: { name: string, build: () => PageNode[] }[] = [
	...allPages,
	{ name: 'sequence', build: buildSequencePages },
];

describe('Essential page metadata', () => {
	// Building runs each prop builder's zod `parse`, and every page schema is `.strict()`.
	/**
	 * Every action resolves to the code the backend asserts, or the button is not locked for a user
	 * the server refuses. A custom verb needs an explicit `actionCode` from the application service.
	 */
	it.each(allBuilders)('$name pages declare no ungated action', ({ build }) => {
		expect(findUngatedActions(build())).toEqual([]);
	});

	it.each(allBuilders)('$name pages survive a JSON round-trip unchanged', ({ build }) => {
		const pages = build();

		expect(JSON.parse(JSON.stringify(pages))).toEqual(pages);
	});

	it.each(allPages)('$name pages nest a v2 list and a v2 detail in a split view', ({ build }) => {
		for (const page of build()) {
			const { primary, secondary } = page.props as { primary: TemplateRef, secondary: TemplateRef };

			expect(page.template).toContain('resourceSplitView');
			expect(primary.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
			expect(secondary.template).toBe(RESOURCE_DETAIL_V2_TEMPLATE);
		}
	});

	it('lists a category\'s units as a related resource filtered by the category id', () => {
		const [page] = buildUomCatPages();
		const props = page.props as { secondary: TemplateRef<{ relatedResources: RelatedResource[] }> };
		const [units] = props.secondary.props?.relatedResources ?? [];

		expect(units.label).toBe('uom_sections_uoms');
		expect(units.initialGraph).toEqual({ if: ['category_id', '=', '${id}'] });
		expect(units.linkRoutePath).toBe('essential_uom');
	});
});

type DetailProps = {
	contextualActions: Record<string, { command?: string, actionCode?: string, successNotice?: string }>,
	createNodes: ComponentNode[],
	childrenNodes: ComponentNode[],
	relatedResources: RelatedResource[],
	standardActionCommands: Record<string, string>,
};

function detailOf(page: PageNode): DetailProps {
	return (page.props as { secondary: TemplateRef<DetailProps> }).secondary.props as DetailProps;
}

function blocksOf(nodes: ComponentNode[]): Record<string, unknown>[] {
	return nodes.flatMap(section => section.children ?? []).map(block => block.props ?? {});
}

describe('Sequence pages', () => {
	const [definition, counter, issuance] = buildSequencePages();

	it('mounts definitions and counters as split views and issuances as a flat list, at the given routes', () => {
		const routes = { definition: 'a/def', counter: 'a/ctr', issuance: 'a/iss' };

		expect(buildSequencePages(routes).map(page => page.routePath)).toEqual(['a/def', 'a/ctr', 'a/iss']);
		expect(definition.template).toContain('resourceSplitView');
		expect(counter.template).toContain('resourceSplitView');
		expect(issuance.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
	});

	it('offers archive but no delete, and previews through read', () => {
		const props = detailOf(definition);

		expect(props.standardActionCommands.delete).toBeUndefined();
		expect(props.standardActionCommands.archive).toBe(SequenceDefinitionCommands.SET_IS_ARCHIVED);
		expect(props.contextualActions.preview).toMatchObject({
			command: SequenceDefinitionCommands.PREVIEW,
			actionCode: 'read',
			successNotice: 'sequence.preview_result',
		});
	});

	it('locks every rule field once a number was issued, never the name or description', () => {
		const locks = Object.assign({}, ...blocksOf(detailOf(definition).childrenNodes)
			.map(block => block.lockedFields ?? {})) as Record<string, { when: unknown, hint: string }>;

		expect(Object.keys(locks).sort()).toEqual([
			'code', 'format_owner', 'increment', 'initial_value', 'issuance_retention_days', 'padding',
			'prefix_template', 'reset_period', 'suffix_template', 'timezone',
		]);
		expect(locks.code).toEqual({
			when: { field: 'first_issued_at', operator: 'exists' }, hint: 'sequence.locked_hint',
		});
	});

	it('never lists the server-only secret, nor server-computed fields on create', () => {
		const { createNodes, childrenNodes } = detailOf(definition);

		expect(JSON.stringify([createNodes, childrenNodes])).not.toContain('algorithm_params');
		const createFields = blocksOf(createNodes).flatMap(block => block.fields as string[]);
		expect(createFields).not.toContain('scope_type');
		expect(createFields).not.toContain('first_issued_at');
	});

});

describe('Sequence counter and issuance pages', () => {
	const [definition, counter] = buildSequencePages();

	it('links counters and issuances filtered by their definition and counter', () => {
		const [counters, issuances] = detailOf(definition).relatedResources;
		const [counterIssuances] = detailOf(counter).relatedResources;

		expect(counters.initialGraph).toEqual({ if: ['definition_id', '=', '${id}'] });
		expect(counters.linkRoutePath).toBe('essential_sequence_counter');
		expect(issuances.initialGraph).toEqual({ if: ['definition_id', '=', '${id}'] });
		expect(counterIssuances.initialGraph).toEqual({ if: ['counter_id', '=', '${id}'] });
		expect(counterIssuances.linkRoutePath).toBe('essential_sequence_issuance');
		expect(counterIssuances.linkField).toBeUndefined();
	});

	it('keeps counters read-only: only getById', () => {
		expect(detailOf(counter).standardActionCommands).toEqual({
			getById: SequenceCounterCommands.GET_BY_ID,
		});
	});
});
