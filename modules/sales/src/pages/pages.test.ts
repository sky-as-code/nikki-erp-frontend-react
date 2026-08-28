import { describe, expect, it } from 'vitest';

import { buildSalesBillPages } from './salesBill';
import { buildSalesChannelPages } from './salesChannel';
import { buildSalesComboPages } from './salesCombo';
import { buildSalesFiscalRequestPages } from './salesFiscalRequest';
import { buildSalesOrderPages } from './salesOrder';
import { buildSalesPaymentPages } from './salesPayment';
import { buildSalesPointPages } from './salesPoint';
import { buildSalesPricelistPages } from './salesPricelist';
import { buildSalesPromotionProgramPages } from './salesPromotionProgram';
import { buildSalesQuotationPages } from './salesQuotation';
import { buildSalesVoucherCodePages } from './salesVoucherCode';
import * as c from '../constants';

import type { ComponentNode, PageNode } from '@nikkierp/viewengine/metadata';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'salesOrder', build: buildSalesOrderPages },
	{ name: 'salesQuotation', build: buildSalesQuotationPages },
	{ name: 'salesBill', build: buildSalesBillPages },
	{ name: 'salesPayment', build: buildSalesPaymentPages },
	{ name: 'salesFiscalRequest', build: buildSalesFiscalRequestPages },
	{ name: 'salesPricelist', build: buildSalesPricelistPages },
	{ name: 'salesPromotionProgram', build: buildSalesPromotionProgramPages },
	{ name: 'salesCombo', build: buildSalesComboPages },
	{ name: 'salesVoucherCode', build: buildSalesVoucherCodePages },
	{ name: 'salesChannel', build: buildSalesChannelPages },
	{ name: 'salesPoint', build: buildSalesPointPages },
];

describe('Sales page metadata', () => {
	/**
	 * Building a page runs each prop builder's zod `parse`, so an invalid prop set throws here rather
	 * than at render time. `tsc` cannot catch it: the builders take a permissive input type and
	 * validate at runtime against `.strict()` schemas.
	 */
	it.each(allPages)('$name pages build without a schema violation', ({ build }) => {
		expect(() => build()).not.toThrow();
	});

	/**
	 * Page metadata crosses a bundle boundary, so it must be plain JSON, never JSX or live objects. A
	 * class or function here would pass local tests and fail once the micro-app is loaded remotely.
	 */
	it.each(allPages)('$name pages survive a JSON round-trip unchanged', ({ build }) => {
		const pages = build();

		expect(JSON.parse(JSON.stringify(pages))).toEqual(pages);
	});

	it.each(allPages)('$name pages carry no functions or class instances', ({ build }) => {
		expect(findNonPlainValue(build(), '$')).toBeNull();
	});

	/**
	 * URL paths separate words with `_`. Nothing checks that a hand-written `menu.ts` link resolves to
	 * a declared route, so the list is pinned here — a rename that misses the menu is otherwise a dead
	 * link discovered only at runtime.
	 */
	it('registers one route per page, all snake_case', () => {
		const routePaths = allPages.flatMap(({ build }) => build().map(page => page.routePath));

		expect(routePaths).toEqual([
			'sales_orders', 'sales_quotations', 'sales_bills', 'sales_payments',
			'sales_fiscal_requests', 'sales_pricelists', 'sales_promotion_programs', 'sales_combos',
			'sales_voucher_codes', 'sales_channels', 'sales_points',
		]);
		for (const routePath of routePaths) {
			expect(routePath).toMatch(/^[a-z][a-z0-9_]*$/);
		}
	});

	it.each(allPages)('$name nests both split-view panes as template refs', ({ build }) => {
		const [page] = build();
		const props = page.props as { primary: { template: string }, secondary: { template: string } };

		expect(page.template).toContain('resourceSplitView');
		expect(props.primary.template).toContain('resourceList');
		expect(props.secondary.template).toContain('resourceDetails');
	});
});

describe('Sales schema binding', () => {
	/**
	 * A schema name must match the backend Go constant verbatim; a mismatch fails silently, with
	 * `SchemaRegistry` never resolving and the page stuck on its spinner. The literals are spelled out
	 * rather than compared to the constants so a typo in a constant is caught too. Note `sales_order`,
	 * not `sales_sales_order`: where the module prefix and the entity word coincide, it appears once.
	 */
	it('binds every page to its backend schema name', () => {
		const bound = allPages.map(({ build }) => splitViewSchemas(build()));

		expect(bound).toEqual([
			{ primary: 'sales_order', secondary: 'sales_order' },
			{ primary: 'sales_quotation', secondary: 'sales_quotation' },
			{ primary: 'sales_bill', secondary: 'sales_bill' },
			{ primary: 'sales_payment', secondary: 'sales_payment' },
			{ primary: 'sales_fiscal_request', secondary: 'sales_fiscal_request' },
			{ primary: 'sales_pricelist', secondary: 'sales_pricelist' },
			{ primary: 'sales_promotion_program', secondary: 'sales_promotion_program' },
			{ primary: 'sales_combo', secondary: 'sales_combo' },
			{ primary: 'sales_voucher_code', secondary: 'sales_voucher_code' },
			{ primary: 'sales_channel', secondary: 'sales_channel' },
			{ primary: 'sales_point', secondary: 'sales_point' },
		]);
	});

	/**
	 * The resource path segment is the schema name — the engine serves `/v1/{module}/{schema_name}` —
	 * so a pluralised or hyphenated path 404s every request. The route paths above are pluralised: the
	 * URL a user sees and the REST path the service calls are not the same string.
	 */
	it('derives every resource path from its schema name, unpluralised', () => {
		expect(c.SALES_ORDER_RESOURCE_PATH).toBe('v1/sales/sales_order');
		expect(c.SALES_BILL_RESOURCE_PATH).toBe(`v1/sales/${c.SALES_BILL_SCHEMA_NAME}`);
		expect(c.SALES_VOUCHER_REDEMPTION_RESOURCE_PATH)
			.toBe(`v1/sales/${c.SALES_VOUCHER_REDEMPTION_SCHEMA_NAME}`);
	});
});

describe('Derived test ids', () => {
	/**
	 * No page authors a `testId`, so every `data-testid` is derived: `resourceTestIdPrefix` builds
	 * `{firstRouteSegment}.{entity}{Part}`, where `entity` is the schema name with its module prefix
	 * stripped (`sales_order` → `order`). Because the id comes from the ROUTE, renaming a route
	 * silently renames every id under it and breaks end-to-end tests without touching this module,
	 * and nothing lints for a missing `data-testid`.
	 *
	 * `resourceTestIdPrefix` is not exported from `@nikkierp/viewkit-mantine` or its `/props` entry
	 * point, so `entityOf` below mirrors it rather than calling it: this pins what the module feeds
	 * the derivation, not the derivation itself.
	 */
	it('derives a unique list id for every page', () => {
		const derived = allPages.flatMap(({ build }) => build().map(page => {
			const segment = page.routePath!.split('/').filter(Boolean)[0];
			return `${segment}.${entityOf(listProps(page).schemaName)}List`;
		}));

		expect(derived).toEqual([
			'sales_orders.orderList',
			'sales_quotations.quotationList',
			'sales_bills.billList',
			'sales_payments.paymentList',
			'sales_fiscal_requests.fiscalRequestList',
			'sales_pricelists.pricelistList',
			'sales_promotion_programs.promotionProgramList',
			'sales_combos.comboList',
			'sales_voucher_codes.voucherCodeList',
			'sales_channels.channelList',
			'sales_points.pointList',
		]);
		// Two pages sharing an id make an end-to-end selector ambiguous rather than wrong, which is
		// the harder failure to diagnose.
		expect(new Set(derived).size).toBe(derived.length);
	});
});

describe('Sales order page', () => {
	/**
	 * `create_order` derives the stored channel from the sales point rather than the request, so a
	 * till cannot claim a sale happened elsewhere. A plain create form would POST straight at the
	 * resource and bypass that, hence no create button and no create form.
	 */
	it('offers no plain create, which would bypass the channel derivation', () => {
		const [page] = buildSalesOrderPages();

		expect(listProps(page).createEnabled).toBe(false);
		expect(detailProps(page).createNodes).toBeUndefined();
		expect((detailProps(page).standardActionCommands as Record<string, unknown>).create)
			.toBeUndefined();
	});

	/** An order's lifecycle is its status; archiving one would hide a fiscal record. */
	it('is not archivable', () => {
		const [page] = buildSalesOrderPages();

		expect(listProps(page).archiveCommand).toBeUndefined();
		expect((detailProps(page).standardActionCommands as Record<string, unknown>).archive)
			.toBeUndefined();
	});

	/**
	 * Confirm redeems vouchers and reserves stock, so it is offered on a draft alone and the backend
	 * refuses a second one rather than treating it as idempotent.
	 */
	it('gates confirm, reprice, apply_voucher and manual_discount on draft', () => {
		const pages = buildSalesOrderPages();

		for (const name of ['confirm', 'reprice', 'apply_voucher', 'manual_discount']) {
			expect(contextualAction(pages, name).condition, `'${name}' condition`)
				.toEqual({ field: 'status', operator: 'equal', value: c.ORDER_STATUS_DRAFT });
		}
	});

	/**
	 * Live statuses only. The backend additionally refuses a paid or fulfilled order, naming a refund
	 * or a return; that refusal is left reachable rather than pre-empted by a narrower condition,
	 * because a hidden button tells the operator nothing.
	 */
	it('offers cancel on the live statuses, not the terminal ones', () => {
		const cancel = contextualAction(buildSalesOrderPages(), 'cancel');

		expect(cancel.condition).toEqual({
			field: 'status',
			operator: 'in',
			value: [c.ORDER_STATUS_DRAFT, c.ORDER_STATUS_CONFIRMED, c.ORDER_STATUS_PROCESSING],
		});
		const statuses = (cancel.condition as { value: string[] }).value;
		expect(statuses).not.toContain(c.ORDER_STATUS_COMPLETED);
		expect(statuses).not.toContain(c.ORDER_STATUS_CANCELLED);
	});

	/** Somebody disputing a receipt for a completed sale is exactly who needs this. */
	it('offers explain_price on everything but a cancelled order', () => {
		expect(contextualAction(buildSalesOrderPages(), 'explain_price').condition)
			.toEqual({ field: 'status', operator: 'not_equal', value: c.ORDER_STATUS_CANCELLED });
	});

	/**
	 * The four status columns are independent: a sale can be completed and unpaid, or paid and
	 * unfulfilled. A badge renderer's `prefix` turns a stored enum value into an i18n key
	 * (`partially_paid` → `payment_status.partially_paid`); without it the raw value reaches the user.
	 */
	it('renders all four status columns as prefixed badges', () => {
		const renderers = listProps(buildSalesOrderPages()[0]).fieldRenderers ?? {};

		// The order's own status reuses the generic `status.` group. Payment states need their own:
		// that group has no `authorized` or `captured`.
		expect(renderers.status?.prefix).toBe('status.');
		expect(renderers.payment_status?.prefix).toBe('payment_status.');
		expect(renderers.fulfillment_status?.prefix).toBe('fulfillment_status.');
		expect(renderers.invoice_status?.prefix).toBe('invoice_status.');
	});
});

describe('Badge translation prefixes', () => {
	/**
	 * Every badge prefix must be one the backend's `sales.json` carries. With no fallback locale, a
	 * prefix with no keys behind it renders the raw `sales:invented_prefix.draft` on screen rather
	 * than failing — visible to a user, invisible to CI. `status.` is deliberately shared across the
	 * draft/confirmed/cancelled-shaped enums; `payment_state.` is separate because that group has no
	 * `authorized`/`captured`.
	 */
	it('uses only badge prefixes the backend locale defines', () => {
		const prefixes = new Set<string>();
		for (const { build } of allPages) {
			for (const page of build()) {
				collectPrefixes(page, prefixes);
			}
		}

		expect([...prefixes].sort()).toEqual([
			'activation_type.', 'adjustment_type.', 'applies_to.', 'calculation_method.',
			'fiscal_status.', 'fulfillment_status.', 'invoice_status.', 'line_type.',
			'payment_state.', 'payment_status.', 'quotation_status.', 'relation_type.', 'status.',
		]);
	});
});

describe('Sales order related tables', () => {
	/**
	 * `${id}` is a placeholder the table resolves from the route param at render time; a literal one
	 * reaching the backend matches nothing. The engine spells equality `=`, not `eq`.
	 */
	it('filters every related table by the order id', () => {
		const [page] = buildSalesOrderPages();
		const tables = collectComponents(page, 'resourceTable');

		expect(tables.map(table => table.props?.schemaName)).toEqual([
			c.SALES_ORDER_LINE_SCHEMA_NAME,
			c.SALES_ORDER_ADJUSTMENT_SCHEMA_NAME,
			c.SALES_FULFILLMENT_REQUEST_SCHEMA_NAME,
			c.SALES_ORDER_EVENT_SCHEMA_NAME,
		]);
		for (const table of tables) {
			expect(table.props?.filterGraph).toEqual({ if: ['sales_order_id', '=', '${id}'] });
		}
	});

	/**
	 * Filtered by `sales_order_id`, not the polymorphic `entity_id`: both columns are real, and the
	 * polymorphic one would show every event whose subject shares an id shape with this order.
	 */
	it('filters the audit trail by the order column, not the polymorphic one', () => {
		const [page] = buildSalesOrderPages();
		const events = collectComponents(page, 'resourceTable')
			.find(table => table.props?.schemaName === c.SALES_ORDER_EVENT_SCHEMA_NAME);

		expect(events?.props?.filterGraph).toEqual({ if: ['sales_order_id', '=', '${id}'] });
	});

	/**
	 * Known gap. `ActionPromptModal` narrows the page's own resource schema to the prompt's named
	 * fields and drops any the schema does not declare, so a prompt naming `reason`, `code`,
	 * `discount_amount` or `sales_manual_discount_id` — action parameters, not order fields — renders
	 * an empty dialog. `apply_voucher` and `manual_discount` are therefore refused by the backend;
	 * `cancel` works, its reason being optional. This test fails once a prompt can collect a field
	 * the resource schema does not declare, and should then be removed with the workaround.
	 */
	it('asks for nothing on the actions whose parameters are not schema fields', () => {
		const pages = buildSalesOrderPages();

		for (const name of ['cancel', 'apply_voucher', 'manual_discount']) {
			expect(contextualAction(pages, name).prompt, `'${name}' prompt`).toBeUndefined();
		}
	});
});

describe('Sales quotation page', () => {
	/**
	 * A quotation is not a draft order: one that never converts would leave a hole in the order
	 * sequence, which fiscal systems read. Hence separate resources with separate routes.
	 */
	it('is its own resource, not a status of the order', () => {
		const [quotation] = buildSalesQuotationPages();
		const [order] = buildSalesOrderPages();

		expect(listProps(quotation).schemaName).toBe(c.SALES_QUOTATION_SCHEMA_NAME);
		expect(listProps(order).schemaName).toBe(c.SALES_ORDER_SCHEMA_NAME);
		expect(quotation.routePath).not.toBe(order.routePath);
	});

	/** Unlike the order, a quotation is client-creatable. */
	it('offers create, unlike the order', () => {
		expect(listProps(buildSalesQuotationPages()[0]).createEnabled).toBe(true);
		expect(listProps(buildSalesOrderPages()[0]).createEnabled).toBe(false);
	});

	/** `draft` is excluded: converting an offer never made would create a sale the customer never saw. */
	it('converts from sent and accepted, never from draft', () => {
		const convert = contextualAction(buildSalesQuotationPages(), 'convert');

		expect(convert.command).toBe('sales.sales_quotation.convert');
		expect(convert.condition).toEqual({
			field: 'status',
			operator: 'in',
			value: [c.QUOTATION_STATUS_SENT, c.QUOTATION_STATUS_ACCEPTED],
		});
		expect((convert.condition as { value: string[] }).value)
			.not.toContain(c.QUOTATION_STATUS_DRAFT);
	});

	/**
	 * `sales_point_id` is a field of the quotation schema, which is what lets the prompt collect it
	 * where the order's `reason` cannot be. It is required at conversion rather than taken from the
	 * quotation: where an offer is rung up is decided when it is accepted.
	 */
	it('collects the sales point before converting', () => {
		const convert = contextualAction(buildSalesQuotationPages(), 'convert');

		expect(convert.prompt?.fields.map(field => field.name)).toEqual(['sales_point_id']);
		expect(convert.prompt?.fields[0].required).toBe(true);
	});
});

describe('Sales bill page', () => {
	/** A bill is raised by confirming an order; one created by hand would carry no allocations. */
	it('offers no plain create', () => {
		expect(listProps(buildSalesBillPages()[0]).createEnabled).toBe(false);
	});

	/**
	 * Known gap. `split` takes a list of parts each holding an allocation map and `merge` a
	 * multi-selection of bills; neither payload can come from a prompt that only narrows the bill's
	 * own schema, so neither is offered as a contextual action. Both commands stay registered and
	 * reachable programmatically.
	 */
	it('offers pay and settle, but not split or merge', () => {
		const pages = buildSalesBillPages();
		const actions = detailProps(pages[0]).contextualActions as Record<string, unknown>;

		expect(Object.keys(actions).sort()).toEqual(['pay', 'settle']);
		expect(actions.split).toBeUndefined();
		expect(actions.merge).toBeUndefined();
	});

	/** A settled bill needs no payment and a cancelled one is not owed. */
	it('gates pay and settle on an open bill', () => {
		const pages = buildSalesBillPages();

		for (const name of ['pay', 'settle']) {
			expect(contextualAction(pages, name).condition, `'${name}' condition`)
				.toEqual({ field: 'status', operator: 'equal', value: c.BILL_STATUS_OPEN });
		}
	});

	/**
	 * The relation carries both a source and a target; the lineage table filters on `source_bill_id`
	 * so a bill's own page says what became of it.
	 */
	it('filters each related table by its own foreign key', () => {
		const [page] = buildSalesBillPages();
		const byName = new Map(collectComponents(page, 'resourceTable')
			.map(table => [table.props?.schemaName as string, table]));

		expect(byName.get(c.SALES_BILL_LINE_SCHEMA_NAME)?.props?.filterGraph)
			.toEqual({ if: ['sales_bill_id', '=', '${id}'] });
		expect(byName.get(c.SALES_PAYMENT_SCHEMA_NAME)?.props?.filterGraph)
			.toEqual({ if: ['sales_bill_id', '=', '${id}'] });
		expect(byName.get(c.SALES_FISCAL_REQUEST_SCHEMA_NAME)?.props?.filterGraph)
			.toEqual({ if: ['sales_bill_id', '=', '${id}'] });
		expect(byName.get(c.SALES_BILL_RELATION_SCHEMA_NAME)?.props?.filterGraph)
			.toEqual({ if: ['source_bill_id', '=', '${id}'] });
	});
});

describe('Read-only resources', () => {
	/**
	 * Payments and fiscal requests are written by actions (`pay`, `request_invoice`), not by clients,
	 * so neither page offers a create form or an update command. The IAM seed grants `read` alone, so
	 * an offered button would fail at the server with a 403.
	 */
	it('offers neither create nor update on payments and fiscal requests', () => {
		for (const build of [buildSalesPaymentPages, buildSalesFiscalRequestPages]) {
			const [page] = build();
			const standard = detailProps(page).standardActionCommands as Record<string, unknown>;

			expect(listProps(page).createEnabled).toBe(false);
			expect(standard.create).toBeUndefined();
			expect(standard.update).toBeUndefined();
			expect(detailProps(page).createNodes).toBeUndefined();
		}
	});

	/** Neither has a lifecycle reachable from here. */
	it('offers no contextual actions on payments or fiscal requests', () => {
		for (const build of [buildSalesPaymentPages, buildSalesFiscalRequestPages]) {
			expect(detailProps(build()[0]).contextualActions).toBeUndefined();
		}
	});
});

describe('Setup resources', () => {
	/**
	 * A point has both `archive` and `unarchive`; a channel has only `archive`. The backend offers
	 * exactly these, so a button for one it lacks would never succeed.
	 */
	it('offers unarchive on a point and not on a channel', () => {
		const pointActions = detailProps(buildSalesPointPages()[0])
			.contextualActions as Record<string, unknown>;
		const channelActions = detailProps(buildSalesChannelPages()[0])
			.contextualActions as Record<string, unknown>;

		expect(pointActions.unarchive).toBeDefined();
		expect(channelActions.unarchive).toBeUndefined();
	});

	/** Suspending stops new sales; activating resumes them. Each is offered from the other state. */
	it('pairs suspend and activate on the opposite statuses', () => {
		for (const build of [buildSalesChannelPages, buildSalesPointPages]) {
			const pages = build();

			expect(contextualAction(pages, 'suspend').condition)
				.toEqual({ field: 'status', operator: 'equal', value: c.CHANNEL_STATUS_ACTIVE });
			expect(contextualAction(pages, 'activate').condition)
				.toEqual({ field: 'status', operator: 'equal', value: c.CHANNEL_STATUS_SUSPENDED });
		}
	});

	/**
	 * The three payment-method actions need a `payment_method_id`, which is not a field of the channel
	 * schema, so a prompt cannot collect it. Registered as commands, not offered as buttons.
	 */
	it('offers no payment-method actions on the channel page', () => {
		const actions = detailProps(buildSalesChannelPages()[0])
			.contextualActions as Record<string, unknown>;

		expect(Object.keys(actions).sort()).toEqual(['activate', 'archive', 'suspend']);
	});
});

describe('Pricing resources', () => {
	/**
	 * Making a pricelist the default is a move, not a set: the flag leaves whichever list holds it,
	 * and two defaults is a state the resolver cannot choose between.
	 */
	it('offers set_default only on a list that is not already default', () => {
		const action = contextualAction(buildSalesPricelistPages(), 'set_default');

		expect(action.command).toBe('sales.sales_pricelist.set_default');
		expect(action.condition).toEqual({
			field: 'is_default', operator: 'not_equal', value: true,
		});
	});

	/** Master data falls out of use without being cancelled, so all four are archivable. */
	it('makes every pricing resource archivable', () => {
		for (const build of [buildSalesPricelistPages, buildSalesPromotionProgramPages,
			buildSalesComboPages, buildSalesVoucherCodePages]) {
			expect(listProps(build()[0]).archiveCommand).toBeDefined();
		}
	});

	/**
	 * `sales_voucher_redemption` links to its code through `voucher_code_id`, not
	 * `sales_voucher_code_id` — one of three children here that break the `{parent_schema}_id`
	 * convention. A filter naming the conventional column returns an empty table, not an error.
	 */
	it('filters redemptions by the unconventional foreign key', () => {
		const [page] = buildSalesVoucherCodePages();
		const [redemptions] = collectComponents(page, 'resourceTable');

		expect(redemptions.props?.schemaName).toBe(c.SALES_VOUCHER_REDEMPTION_SCHEMA_NAME);
		expect(redemptions.props?.filterGraph).toEqual({ if: ['voucher_code_id', '=', '${id}'] });
	});

	/**
	 * The items use `valid_to` where the pricelist itself uses `valid_until`; naming the wrong one
	 * renders a permanently empty column.
	 */
	it('names the item validity column as the item schema spells it', () => {
		const [page] = buildSalesPricelistPages();
		const [items] = collectComponents(page, 'resourceTable');
		const fields = items.props?.fields as string[];

		expect(fields).toContain('valid_to');
		expect(fields).not.toContain('valid_until');
	});
});

type ContextualAction = {
	label: string,
	command: string,
	condition?: unknown,
	prompt?: { fields: { name: string, required?: boolean }[] },
};

type ListProps = {
	schemaName: string,
	createEnabled?: boolean,
	filterGraph?: Record<string, unknown>,
	archiveCommand?: string,
	deleteCommand?: string,
	fieldRenderers?: Record<string, { prefix?: string }>,
};

function listProps(page: PageNode): ListProps {
	return (page.props as { primary: { props: ListProps } }).primary.props;
}

function detailProps(page: PageNode): Record<string, unknown> {
	return (page.props as { secondary: { props: Record<string, unknown> } }).secondary.props;
}

function contextualAction(pages: PageNode[], name: string): ContextualAction {
	const actions = detailProps(pages[0]).contextualActions as
		Record<string, ContextualAction> | undefined;
	const action = actions?.[name];

	expect(action, `contextual action '${name}' is missing`).toBeDefined();
	return action!;
}

function splitViewSchemas(pages: PageNode[]): { primary: string, secondary: string } {
	const [page] = pages;
	return {
		primary: listProps(page).schemaName,
		secondary: detailProps(page).schemaName as string,
	};
}

/**
 * Mirrors `viewkit-mantine`'s private `entityOf` for the `data-testid` derivation: a schema name is
 * `{module}_{entity}`, and the route already implies the module, so only the entity is repeated.
 * `sales_order` → `order`, `sales_voucher_code` → `voucherCode`.
 */
function entityOf(schemaName: string): string {
	const parts = schemaName.split('_').filter(Boolean);
	const entityParts = parts.length > 1 ? parts.slice(1) : parts;
	return entityParts
		.map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
		.join('');
}

/** Collects every `prefix` a field renderer declares, at any depth in the page. */
function collectPrefixes(value: unknown, found: Set<string>): void {
	if (Array.isArray(value)) {
		value.forEach(item => collectPrefixes(item, found));
		return;
	}
	if (value === null || typeof value !== 'object') {
		return;
	}
	for (const [key, item] of Object.entries(value)) {
		if (key === 'prefix' && typeof item === 'string') {
			found.add(item);
			continue;
		}
		collectPrefixes(item, found);
	}
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
		// A class instance has a prototype other than Object.prototype, so it would not survive the
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
