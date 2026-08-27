import { describe, expect, it } from 'vitest';

import { buildTaxPages } from './tax';
import { buildTaxGroupPages } from './taxGroup';
import { buildTaxJurisdictionPages } from './taxJurisdiction';
import { buildTaxMappingPages } from './taxMapping';
import { buildTaxProductClassificationPages } from './taxProductClassification';
import { buildTaxRateVersionPages } from './taxRateVersion';
import { buildTaxRoundingPolicyPages } from './taxRoundingPolicy';
import { buildTaxRulePages } from './taxRule';
import { buildTaxSimulatorPages } from './taxSimulator';
import * as c from '../constants';

import type { ComponentNode, PageNode } from '@nikkierp/viewengine/metadata';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'taxJurisdiction', build: buildTaxJurisdictionPages },
	{ name: 'taxGroup', build: buildTaxGroupPages },
	{ name: 'taxProductClassification', build: buildTaxProductClassificationPages },
	{ name: 'tax', build: buildTaxPages },
	{ name: 'taxRateVersion', build: buildTaxRateVersionPages },
	{ name: 'taxRule', build: buildTaxRulePages },
	{ name: 'taxMapping', build: buildTaxMappingPages },
	{ name: 'taxRoundingPolicy', build: buildTaxRoundingPolicyPages },
	{ name: 'taxSimulator', build: buildTaxSimulatorPages },
];

describe('Accounting page metadata', () => {
	/**
	 * Building a page runs each prop builder's zod `parse`, so an invalid prop set throws here
	 * rather than at render time. `tsc` cannot catch it: the builders take a permissive input type
	 * and validate at runtime, and every page schema is `.strict()` — a misspelled prop is an
	 * error rather than a silently dead one.
	 */
	it.each(allPages)('$name pages build without a schema violation', ({ build }) => {
		expect(() => build()).not.toThrow();
	});

	/**
	 * Page metadata crosses a bundle boundary, so it must be plain JSON. A class, function or live
	 * object here would survive local tests and fail once the micro-app is loaded remotely.
	 */
	it.each(allPages)('$name pages survive a JSON round-trip unchanged', ({ build }) => {
		const pages = build();

		expect(JSON.parse(JSON.stringify(pages))).toEqual(pages);
	});

	it.each(allPages)('$name pages carry no functions or class instances', ({ build }) => {
		expect(findNonPlainValue(build(), '$')).toBeNull();
	});

	/**
	 * URL paths separate words with `_`. The menu links in `menu.ts` are written by hand and
	 * nothing checks that one resolves to a declared route, so the exact list is pinned here: a
	 * rename that misses the menu shows up as a dead link only at runtime.
	 *
	 * The order matches the menu's, which is the order an administrator configures them in.
	 */
	it('registers one route per page, all snake_case', () => {
		const routePaths = allPages.flatMap(({ build }) => build().map(page => page.routePath));

		expect(routePaths).toEqual([
			'tax_jurisdictions', 'tax_groups', 'tax_classifications', 'taxes', 'tax_rates',
			'tax_rules', 'tax_mappings', 'tax_rounding_policies', 'tax_simulator',
		]);
		for (const routePath of routePaths) {
			expect(routePath).toMatch(/^[a-z][a-z0-9_]*$/);
		}
	});

});

describe('Accounting page bindings', () => {
	/**
	 * The schema names are written as literals rather than read from `constants`, so a typo in the
	 * constant itself is caught. A name that drifts from the backend Go constant makes
	 * `SchemaRegistry` reject the schema, which shows up as a page that loads forever rather than
	 * as an error.
	 */
	it('binds every page to its backend schema name verbatim', () => {
		const bound = allPages
			.filter(({ name }) => name !== 'taxSimulator')
			.flatMap(({ build }) => build().flatMap(page => splitViewSchemas(page)));

		expect(new Set(bound)).toEqual(new Set([
			'accounting_tax_jurisdiction',
			'accounting_tax_group',
			'accounting_tax_product_classification',
			'accounting_tax',
			'accounting_tax_rate_version',
			'accounting_tax_rule',
			'accounting_tax_mapping',
			'accounting_tax_rounding_policy',
		]));
	});

	/**
	 * Every CRUD page is a split view: a list beside a detail pane. The simulator is not — it is
	 * served by this module's own view kit, which is the whole reason that kit exists.
	 */
	it.each(allPages.filter(({ name }) => name !== 'taxSimulator'))(
		'$name pages nest a list and a detail pane in a split view',
		({ build }) => {
			for (const page of build()) {
				expect(page.template).toContain('resourceSplitView');
				const rendered = JSON.stringify(page);
				expect(rendered).toContain('resourceList');
				expect(rendered).toContain('resourceDetails');
			}
		},
	);

	it('serves the simulator from the accounting view kit, not a resource template', () => {
		const [simulator] = buildTaxSimulatorPages();

		expect(simulator.template).toBe('nikkierp.accounting.pages.templates.taxSimulator.v1');
	});

	/**
	 * A related table filters by the parent's route id. `'${id}'` is a literal placeholder the
	 * engine resolves at render time — not a JS template literal — and the operator is `'='`, not
	 * `'eq'`, which the engine rejects outright.
	 */
	it('filters every related table by its parent id', () => {
		const withChildren = [buildTaxPages, buildTaxRulePages, buildTaxMappingPages];
		const tables = withChildren.flatMap(build =>
			build().flatMap(page => collectComponents(page, 'resourceTable')));

		expect(tables.length).toBe(5);
		for (const table of tables) {
			const filterGraph = (table.props as { filterGraph?: { if?: unknown[] } }).filterGraph;
			expect(filterGraph?.if?.[1]).toBe('=');
			expect(filterGraph?.if?.[2]).toBe('${id}');
		}
	});

});

describe('Accounting page actions and renderers', () => {
	/**
	 * The five versioned resources are the ones the lifecycle actions belong on. A publish action
	 * on a resource with no lifecycle would be offered and then refused by the backend; one absent
	 * from a resource that has a lifecycle leaves it unpublishable through the UI.
	 *
	 * Definition versions carry a lifecycle too, but have no page of their own — they are edited
	 * from the tax that owns them — so four pages carry the actions.
	 */
	it('offers publish and withdraw on exactly the versioned resources', () => {
		const withLifecycle = [
			{ name: 'taxRateVersion', build: buildTaxRateVersionPages },
			{ name: 'taxRule', build: buildTaxRulePages },
			{ name: 'taxMapping', build: buildTaxMappingPages },
			{ name: 'taxRoundingPolicy', build: buildTaxRoundingPolicyPages },
		];

		for (const { name, build } of withLifecycle) {
			const actions = contextualActions(build()[0]);
			expect(actions, name).toHaveProperty('publish');
			expect(actions, name).toHaveProperty('withdraw');
		}

		// A jurisdiction has no lifecycle: it is either there or archived.
		expect(contextualActions(buildTaxJurisdictionPages()[0])).toBeUndefined();
		expect(contextualActions(buildTaxGroupPages()[0])).toBeUndefined();
	});

	/**
	 * Publish is offered only from draft, and withdraw from draft or published. Withdrawn is
	 * terminal — offering either on a withdrawn record would surface a button the backend refuses.
	 */
	it('gates the lifecycle actions on the states that allow them', () => {
		const actions = contextualActions(buildTaxRulePages()[0]) as Record<string, {
			condition?: { field?: string, operator?: string, value?: unknown },
		}>;

		expect(actions.publish.condition).toEqual({
			field: 'lifecycle_status', operator: 'equal', value: c.LIFECYCLE_DRAFT,
		});
		expect(actions.withdraw.condition).toEqual({
			field: 'lifecycle_status',
			operator: 'in',
			value: [c.LIFECYCLE_DRAFT, c.LIFECYCLE_PUBLISHED],
		});
	});

	/**
	 * A badge without a prefix renders the raw stored enum — `no_tax_applicable` rather than the
	 * localized label. Both halves must exist in the backend langJson for both locales; there is
	 * deliberately no fallback.
	 */
	it('gives every badge renderer an i18n prefix', () => {
		for (const { name, build } of allPages) {
			for (const page of build()) {
				for (const renderer of Object.values(fieldRenderers(page))) {
					if (renderer.renderer === 'badge') {
						expect(renderer.prefix, name).toMatch(/\.$/);
					}
				}
			}
		}
	});
});

/** The `contextualActions` of a split view's detail pane, if it declares any. */
function contextualActions(page: PageNode): Record<string, unknown> | undefined {
	const props = page.props as { secondary?: { props?: { contextualActions?: Record<string, unknown> } } };
	return props.secondary?.props?.contextualActions;
}

/** Every `fieldRenderers` map on a page, flattened. */
function fieldRenderers(page: PageNode): Record<string, { renderer?: string, prefix?: string }> {
	const props = page.props as {
		primary?: { props?: { fieldRenderers?: Record<string, { renderer?: string, prefix?: string }> } },
	};
	return props.primary?.props?.fieldRenderers ?? {};
}

/** The schema names both panes of a split view bind to. */
function splitViewSchemas(page: PageNode): string[] {
	const props = page.props as {
		primary?: { props?: { schemaName?: string } },
		secondary?: { props?: { schemaName?: string } },
	};
	return [props.primary?.props?.schemaName, props.secondary?.props?.schemaName]
		.filter((name): name is string => typeof name === 'string');
}

function collectComponents(page: PageNode, componentIdPart: string): ComponentNode[] {
	const found: ComponentNode[] = [];
	walk(page);
	return found;

	function walk(value: unknown): void {
		if (Array.isArray(value)) {
			value.forEach(walk);
			return;
		}
		if (value === null || typeof value !== 'object') {
			return;
		}
		const node = value as ComponentNode;
		if (typeof node.component === 'string' && node.component.includes(componentIdPart)) {
			found.push(node);
		}
		Object.values(value).forEach(walk);
	}
}

function findNonPlainValue(value: unknown, path: string): string | null {
	if (value === null || typeof value === 'string' || typeof value === 'number'
		|| typeof value === 'boolean') {
		return null;
	}
	if (typeof value === 'function') {
		return path;
	}
	if (Array.isArray(value)) {
		for (const [index, item] of value.entries()) {
			const found = findNonPlainValue(item, `${path}[${index}]`);
			if (found) {
				return found;
			}
		}
		return null;
	}
	if (typeof value === 'object') {
		// A class instance has a prototype other than Object.prototype; it would not survive the
		// trip through JSON that a bundle boundary imposes.
		const prototype = Object.getPrototypeOf(value);
		if (prototype !== Object.prototype && prototype !== null) {
			return path;
		}
		for (const [key, item] of Object.entries(value)) {
			const found = findNonPlainValue(item, `${path}.${key}`);
			if (found) {
				return found;
			}
		}
	}
	return null;
}
