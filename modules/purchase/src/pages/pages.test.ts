import { describe, expect, it } from 'vitest';

import { buildAgreementPages } from './agreement';
import { buildConfigurationPages } from './configuration';
import { buildPurchaseOrderPages } from './purchaseOrder';
import * as c from '../constants';

import type { ComponentNode, PageNode } from '@nikkierp/viewengine/metadata';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'purchaseOrder', build: buildPurchaseOrderPages },
	{ name: 'agreement', build: buildAgreementPages },
	{ name: 'configuration', build: buildConfigurationPages },
];

describe('Purchase page metadata', () => {
	/**
	 * Building a page runs each prop builder's zod `parse`, so an invalid prop set throws here
	 * rather than at render time. `tsc` cannot catch it: the builders take a permissive input type
	 * and validate at runtime, and both page schemas are `.strict()` — a misspelled prop is an
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
	 * `overview` is deliberately absent — the menu offers it but no page declares it yet.
	 */
	it('registers one route per page, all snake_case', () => {
		const routePaths = allPages.flatMap(({ build }) => build().map(page => page.routePath));

		expect(routePaths).toEqual([
			'requests_for_quotation', 'purchase_orders', 'agreements', 'configuration',
		]);
		for (const routePath of routePaths) {
			expect(routePath).toMatch(/^[a-z][a-z0-9_]*$/);
		}
	});

	/**
	 * A schema name that does not match the backend Go constant fails silently: `SchemaRegistry`
	 * rejects it and the page hangs on its loading spinner rather than reporting anything.
	 *
	 * The literals are written out here rather than compared to the constants, so a typo in the
	 * constant itself is caught too. Note the order is `purchase_order`, NOT
	 * `purchase_purchase_order`: the module prefix and the entity name coincide.
	 */
	it('binds every page to its backend schema name', () => {
		for (const page of buildPurchaseOrderPages()) {
			expect(splitViewSchemas([page])).toEqual({
				primary: 'purchase_order',
				secondary: 'purchase_order',
			});
		}
		expect(splitViewSchemas(buildAgreementPages())).toEqual({
			primary: 'purchase_agreement',
			secondary: 'purchase_agreement',
		});
		expect(splitViewSchemas(buildConfigurationPages())).toEqual({
			primary: 'purchase_configuration',
			secondary: 'purchase_configuration',
		});
	});

	it('nests both split-view panes as template refs', () => {
		const [page] = buildPurchaseOrderPages();
		const props = page.props as { primary: { template: string }, secondary: { template: string } };

		expect(page.template).toContain('resourceSplitView');
		expect(props.primary.template).toContain('resourceList');
		expect(props.secondary.template).toContain('resourceDetails');
	});
});

describe('RFQ and purchase order routes', () => {
	/**
	 * PUR-R1: one resource, two views. An order starts as a request for quotation and becomes a
	 * committed order on confirmation — same row, same id, different status. Modelling them as two
	 * resources would mean an order changing identity at confirmation and every link to it
	 * breaking.
	 */
	it('serves both routes from the one order schema', () => {
		const [quotations, orders] = buildPurchaseOrderPages();

		expect(quotations.routePath).toBe('requests_for_quotation');
		expect(orders.routePath).toBe('purchase_orders');
		expect(listProps(quotations).schemaName).toBe(c.PURCHASE_ORDER_SCHEMA_NAME);
		expect(listProps(orders).schemaName).toBe(c.PURCHASE_ORDER_SCHEMA_NAME);
	});

	/**
	 * The two routes differ by their filter and by the merge toolbar action, and by nothing else.
	 * The DETAIL pane in particular is identical: confirming an RFQ leaves the user on the record
	 * rather than having it vanish from under them.
	 */
	it('distinguishes the two routes by filter, sharing one detail pane', () => {
		const [quotations, orders] = buildPurchaseOrderPages();

		expect(listProps(quotations).filterGraph).toEqual({
			if: ['status', 'in', ['rfq', 'rfq_sent', 'to_approve']],
		});
		expect(listProps(orders).filterGraph).toEqual({
			if: ['status', 'in', ['purchase_order', 'cancelled']],
		});
		expect(detailProps(quotations)).toEqual(detailProps(orders));
	});

	/**
	 * The backend accepts a merge of `rfq` and `rfq_sent` orders only, refusing anything else by
	 * name. A merge button on the committed-orders toolbar would therefore be one that never once
	 * succeeds, so it is offered on the quotation route alone.
	 */
	it('offers merge on the quotation route only', () => {
		const [quotations, orders] = buildPurchaseOrderPages();

		expect(listProps(quotations).extraActions?.map(action => action.command))
			.toEqual(['purchase.purchase_order.merge']);
		expect(listProps(orders).extraActions).toEqual([]);
	});

	/**
	 * Merge acts on a selection rather than on one record, and `runCommand` publishes `{ ids }`
	 * from the selected rows. Without both flags the toolbar would fire it on nothing, or on only
	 * the first row selected — either of which merges the wrong set.
	 */
	it('requires a multiple selection to merge', () => {
		const [merge] = listProps(buildPurchaseOrderPages()[0]).extraActions ?? [];

		expect(merge.requireSelection).toBe(true);
		expect(merge.supportMultiple).toBe(true);
	});

	/**
	 * Every status must appear on exactly one of the two routes. A status on neither is invisible
	 * except by direct link; one on both shows the same order in two places, which reads as a
	 * duplicate.
	 */
	it('partitions every order status across the two routes', () => {
		const [quotations, orders] = buildPurchaseOrderPages();
		const quotationStatuses = filterStatuses(listProps(quotations).filterGraph);
		const orderStatuses = filterStatuses(listProps(orders).filterGraph);
		const every = [
			c.ORDER_STATUS_RFQ, c.ORDER_STATUS_RFQ_SENT, c.ORDER_STATUS_TO_APPROVE,
			c.ORDER_STATUS_PURCHASE_ORDER, c.ORDER_STATUS_CANCELLED,
		];

		expect([...quotationStatuses, ...orderStatuses].sort()).toEqual([...every].sort());
		expect(quotationStatuses.filter(status => orderStatuses.includes(status))).toEqual([]);
	});
});

describe('Purchase order actions', () => {
	/**
	 * The backend is the authority on what is permitted; these conditions decide only what to
	 * OFFER. A button on a record the backend will refuse invites a user to attempt what cannot
	 * work, so each is gated on the statuses it actually makes sense in.
	 */
	it('gates confirm on the quotation stages', () => {
		const confirm = contextualAction(buildPurchaseOrderPages(), 'confirm');

		expect(confirm.command).toBe('purchase.purchase_order.confirm');
		expect(confirm.condition).toEqual({
			field: 'status', operator: 'in', value: ['rfq', 'rfq_sent'],
		});
	});

	/**
	 * BR 23: `purchase_order` is NOT terminal, and cancelling a committed order is exactly the
	 * case the rule exists for. Gating cancel on the quotation stages would hide it precisely
	 * where it matters.
	 */
	it('offers cancel from every status but cancelled', () => {
		expect(contextualAction(buildPurchaseOrderPages(), 'cancel').condition).toEqual({
			field: 'status', operator: 'not_equal', value: 'cancelled',
		});
	});

	/** Lock and unlock are gated on the flag, not the status: that is what they act on. */
	it('gates lock and unlock on the lock flag', () => {
		const pages = buildPurchaseOrderPages();

		expect(contextualAction(pages, 'lock').condition)
			.toEqual({ field: 'is_locked', operator: 'not_equal', value: true });
		expect(contextualAction(pages, 'unlock').condition)
			.toEqual({ field: 'is_locked', operator: 'equal', value: true });
	});

	/**
	 * Comparing alternatives that do not exist returns an empty comparison rather than an error,
	 * so the button is offered only once the order is actually in a sourcing group.
	 */
	it('gates compare_alternatives on membership of a sourcing group', () => {
		expect(contextualAction(buildPurchaseOrderPages(), 'compare_alternatives').condition)
			.toEqual({ field: 'sourcing_group_id', operator: 'exists' });
	});

	/** Copying a document is safe from any status, including cancelled — trying again is normal. */
	it('offers duplicate unconditionally', () => {
		expect(contextualAction(buildPurchaseOrderPages(), 'duplicate').condition).toBeUndefined();
	});

	/**
	 * An alternative is the same requirement quoted by somebody else, so the vendor is the point.
	 * `vendor_id` is a real field of the order schema, which is what lets the prompt collect it —
	 * see the gap recorded below for the fields that are not.
	 */
	it('collects the vendor before opening an alternative', () => {
		const action = contextualAction(buildPurchaseOrderPages(), 'create_alternative');

		expect(action.prompt?.fields.map(field => field.name)).toEqual(['vendor_id']);
		expect(action.prompt?.fields[0].required).toBe(true);
	});

	/**
	 * KNOWN GAP, pinned deliberately rather than left to be rediscovered.
	 *
	 * `ActionPromptModal.buildPromptSchema` narrows the page's OWN resource schema to the prompt's
	 * named fields and DROPS any name the schema does not declare. `reason` and
	 * `alternative_choice` are action parameters, not fields of an order — a reason belongs to the
	 * transition and is stored on the audit event — so a prompt naming either renders an empty
	 * dialog that submits nothing.
	 *
	 * Consequences, in order of severity:
	 *  - `unlock` is REFUSED by the backend without a reason
	 *    (`purchase_order.unlock_reason_required`). It is still offered, so the user sees that
	 *    violation rather than a locked order with no visible way to reopen it.
	 *  - `cancel` works: its reason is optional, and the audit event simply records no note.
	 *  - `confirm` works until the order has open alternatives, at which point the backend returns
	 *    the §31 warning and there is no way to answer it from here.
	 *
	 * Closing this needs a prompt that can collect a field the resource schema does not declare.
	 * This test fails the moment someone adds such a prompt, which is the point: it should be
	 * removed together with the workaround, not left asserting a limitation that no longer exists.
	 */
	it('asks for nothing on the actions whose parameters are not schema fields', () => {
		const pages = buildPurchaseOrderPages();

		for (const name of ['unlock', 'cancel', 'confirm']) {
			expect(contextualAction(pages, name).prompt, `'${name}' prompt`).toBeUndefined();
		}
	});

	/**
	 * A badge renderer's `prefix` turns a stored enum value into an i18n key
	 * (`rfq_sent` → `status.rfq_sent`). Without it the raw snake_case value reaches the user.
	 * Both prefixes exist in the backend's langJson for both locales ([PUR-013]).
	 */
	it('renders status and priority as prefixed badges', () => {
		const renderers = listProps(buildPurchaseOrderPages()[0]).fieldRenderers ?? {};

		expect(renderers.status?.prefix).toBe('status.');
		expect(renderers.priority?.prefix).toBe('priority.');
	});
});

describe('Purchase order related tables', () => {
	/**
	 * `${id}` is a placeholder the table resolves from the route param at render time. A literal
	 * `${id}` reaching the backend would match nothing, and the wrong operator is rejected
	 * outright — the engine spells equality `=`, not `eq`.
	 */
	it('filters lines and audit events by the order id', () => {
		const [page] = buildPurchaseOrderPages();
		const tables = collectComponents(page, 'resourceTable');

		expect(tables.map(table => table.props?.schemaName))
			.toEqual([c.PURCHASE_ORDER_LINE_SCHEMA_NAME, c.AUDIT_EVENT_SCHEMA_NAME]);
		expect(tables[0].props?.filterGraph).toEqual({ if: ['purchase_order_id', '=', '${id}'] });
		// Filtered by `entity_id`, not an order-specific column: one audit table records the
		// transitions of both orders and agreements.
		expect(tables[1].props?.filterGraph).toEqual({ if: ['entity_id', '=', '${id}'] });
	});

	/** Neither has a page of its own; pointing at one would produce a dead link. */
	it('links no row away from the order page', () => {
		const [page] = buildPurchaseOrderPages();

		for (const table of collectComponents(page, 'resourceTable')) {
			expect(table.props?.linkRoutePath).toBeUndefined();
		}
	});

	/**
	 * The line's money columns are computed by the backend from the line itself ([PUR-014]) and
	 * recomputed onto the header in the same transaction. They are shown because they are what the
	 * document is for — but a `line_type` badge is what explains the blank ones, since a section,
	 * subsection or note carries no money at all.
	 */
	it('shows the computed money columns and explains the empty ones', () => {
		const [page] = buildPurchaseOrderPages();
		const [lines] = collectComponents(page, 'resourceTable');
		const fields = lines.props?.fields as string[];

		expect(fields).toEqual(expect.arrayContaining(['subtotal', 'tax_amount', 'total']));
		const renderers = lines.props?.fieldRenderers as Record<string, { prefix?: string }>;
		expect(renderers.line_type?.prefix).toBe('line_type.');
	});
});

describe('Agreement page', () => {
	/**
	 * The agreement is the one purchase resource that IS archivable: a standing arrangement can
	 * fall out of use without being cancelled, and archiving leaves the orders drawn against it
	 * intact where cancelling would not. The order has no such state — its lifecycle is its status.
	 */
	it('is archivable, unlike the order', () => {
		expect(listProps(buildAgreementPages()[0]).archiveCommand)
			.toBe('core.resource.purchase_agreement.set_is_archived');
		expect(listProps(buildPurchaseOrderPages()[0]).archiveCommand).toBeUndefined();
	});

	/**
	 * Close and cancel are not synonyms, and both are terminal — so the button that fires each has
	 * to be the right one. A closed agreement ran its course and the orders drawn against it
	 * stand; a cancelled one was called off.
	 */
	it('offers close only on a confirmed agreement, and cancel on both live statuses', () => {
		const pages = buildAgreementPages();

		expect(contextualAction(pages, 'close').condition)
			.toEqual({ field: 'status', operator: 'equal', value: 'confirmed' });
		expect(contextualAction(pages, 'cancel').condition)
			.toEqual({ field: 'status', operator: 'in', value: ['draft', 'confirmed'] });
	});

	/** A draft's prices are not agreed yet and a closed one's have been withdrawn. */
	it('draws a new RFQ only from an agreement in force', () => {
		const action = contextualAction(buildAgreementPages(), 'create_rfq');

		expect(action.command).toBe('purchase.purchase_agreement.create_rfq');
		expect(action.condition)
			.toEqual({ field: 'status', operator: 'equal', value: 'confirmed' });
	});

	/**
	 * §41: `ordered_quantity` is derived on read from the confirmed orders referencing the line,
	 * never stored. Naming it as a column would render a permanently empty one.
	 */
	it('shows no ordered quantity column on the agreement lines', () => {
		const [page] = buildAgreementPages();
		const [lines] = collectComponents(page, 'resourceTable');

		expect(lines.props?.schemaName).toBe(c.AGREEMENT_LINE_SCHEMA_NAME);
		expect(lines.props?.fields).not.toContain('ordered_quantity');
	});

	/** The orders drawn against an agreement DO have a page, so these rows link to it. */
	it('links drawn orders to the order page', () => {
		const [page] = buildAgreementPages();
		const tables = collectComponents(page, 'resourceTable');
		const drawn = tables.find(table => table.props?.schemaName === c.PURCHASE_ORDER_SCHEMA_NAME);

		expect(drawn?.props?.filterGraph).toEqual({ if: ['agreement_id', '=', '${id}'] });
		expect(drawn?.props?.linkRoutePath).toBe('purchase_orders');
		expect(drawn?.props?.linkField).toBe('id');
	});
});

describe('Configuration page', () => {
	/**
	 * Configuration has no lifecycle: it is read on every order confirmation to decide whether
	 * approval is required, and changed by editing it.
	 */
	it('offers no lifecycle actions', () => {
		const [page] = buildConfigurationPages();
		const props = detailProps(page) as { contextualActions?: unknown };

		expect(props.contextualActions).toBeUndefined();
	});

	/**
	 * An organization with no configuration row falls back to the backend's defaults — `one_step`,
	 * no threshold — which silently changes how every future order is approved. Reaching that by
	 * deleting the record would make it invisible; editing the mode makes it explicit.
	 */
	it('does not offer deletion', () => {
		const [page] = buildConfigurationPages();

		expect(listProps(page).deleteCommand).toBeUndefined();
		expect((detailProps(page) as {
			standardActionCommands: Record<string, unknown>,
		}).standardActionCommands.delete).toBeUndefined();
	});
});

type ContextualAction = {
	label: string,
	command: string,
	condition?: unknown,
	prompt?: { fields: { name: string, required?: boolean, defaultFromField?: string }[] },
};

type ListProps = {
	schemaName: string,
	filterGraph?: Record<string, unknown>,
	extraActions?: { command: string, requireSelection?: boolean, supportMultiple?: boolean }[],
	archiveCommand?: string,
	deleteCommand?: string,
	fieldRenderers?: Record<string, { prefix?: string }>,
};

/** Reads the list pane's props off a split view. */
function listProps(page: PageNode): ListProps {
	return (page.props as { primary: { props: ListProps } }).primary.props;
}

/** Reads the detail pane's props off a split view. */
function detailProps(page: PageNode): Record<string, unknown> {
	return (page.props as { secondary: { props: Record<string, unknown> } }).secondary.props;
}

/** Reads one contextual action off a split view's detail pane. */
function contextualAction(pages: PageNode[], name: string): ContextualAction {
	const actions = detailProps(pages[0]).contextualActions as
		Record<string, ContextualAction> | undefined;
	const action = actions?.[name];

	expect(action, `contextual action '${name}' is missing`).toBeDefined();
	return action!;
}

/** Reads the schema name bound to each pane of a split view. */
function splitViewSchemas(pages: PageNode[]): { primary: string, secondary: string } {
	const [page] = pages;
	return {
		primary: listProps(page).schemaName,
		secondary: detailProps(page).schemaName as string,
	};
}

/** Reads the status list out of an `{ if: ['status', 'in', [...]] }` filter graph. */
function filterStatuses(filterGraph: Record<string, unknown> | undefined): string[] {
	const clause = filterGraph?.if as [string, string, string[]] | undefined;

	expect(clause, 'filter graph is not an `if` clause').toBeDefined();
	return clause![2];
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

/** Returns the path of the first non-JSON value found, or null when everything is plain. */
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
