import { describe, expect, it } from 'vitest';

import { buildInvoicePages } from './invoice';
import { buildOrderPages } from './order';
import { buildTransactionPages } from './transaction';
import * as c from '../constants';

import type { ComponentNode, PageNode } from '@nikkierp/viewengine/metadata';


const allPages: { name: string, build: () => PageNode[] }[] = [
	{ name: 'order', build: buildOrderPages },
	{ name: 'transaction', build: buildTransactionPages },
	{ name: 'invoice', build: buildInvoicePages },
];

describe('Payment & Invoice page metadata', () => {
	/**
	 * Building a page runs each prop builder's zod `parse`, so an invalid prop set throws here
	 * rather than at render time. `tsc` cannot catch it: the builders take a permissive input
	 * type and validate at runtime.
	 */
	it.each(allPages)('$name pages build without a schema violation', ({ build }) => {
		expect(() => build()).not.toThrow();
	});

	/**
	 * Page metadata crosses a bundle boundary, so it must be plain JSON. A class, function or
	 * live object here would survive local tests and fail once the micro-app is loaded remotely.
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
	 * nothing checks that one resolves to a declared route, so the exact list is pinned here:
	 * a rename that misses the menu shows up as a dead link only at runtime.
	 */
	it('registers one route per page, all snake_case', () => {
		const routePaths = allPages.flatMap(({ build }) => build().map(page => page.routePath));

		expect(routePaths).toEqual(['orders', 'transactions', 'invoices']);
		for (const routePath of routePaths) {
			expect(routePath).toMatch(/^[a-z][a-z0-9_]*$/);
		}
	});

	/**
	 * A schema name that does not match the backend Go constant fails silently: the page hangs on
	 * its loading spinner rather than reporting anything. The literals are written out here rather
	 * than compared to the constants, so that a typo in the constant itself is caught too.
	 */
	it('binds every page to its backend schema name', () => {
		expect(splitViewSchemas(buildOrderPages())).toEqual({
			primary: 'paymentinvoice_order',
			secondary: 'paymentinvoice_order',
		});
		expect(splitViewSchemas(buildInvoicePages())).toEqual({
			primary: 'paymentinvoice_invoice',
			secondary: 'paymentinvoice_invoice',
		});

		const [transactions] = buildTransactionPages();
		expect((transactions.props as { schemaName: string }).schemaName)
			.toBe('paymentinvoice_transaction');
	});

	it('nests both split-view panes as template refs', () => {
		const [page] = buildOrderPages();
		const props = page.props as { primary: { template: string }, secondary: { template: string } };

		expect(page.template).toContain('resourceSplitView');
		expect(props.primary.template).toContain('resourceList');
		expect(props.secondary.template).toContain('resourceDetails');
	});
});

describe('Order page', () => {
	/**
	 * An order is minted by `create_payment`, which records it *and* asks a gateway to start
	 * collecting. A create form here would write the row without the second half, producing an
	 * order no gateway has ever heard of; a delete would destroy the record of a payment attempt.
	 * Neither affordance may appear.
	 */
	it('offers neither create nor delete', () => {
		const [page] = buildOrderPages();
		const props = page.props as {
			primary: { props: Record<string, unknown> },
			secondary: { props: { standardActionCommands: Record<string, unknown> } },
		};

		expect(props.primary.props.createEnabled).toBeFalsy();
		expect(props.primary.props.deleteCommand).toBeUndefined();
		expect(props.secondary.props.standardActionCommands.create).toBeUndefined();
		expect(props.secondary.props.standardActionCommands.delete).toBeUndefined();
	});

	/**
	 * Refund must be offered only on an order that was actually paid. A condition naming a status
	 * the schema does not have would leave the button permanently hidden, which is invisible; one
	 * that is too broad invites the user to attempt what the backend will refuse.
	 */
	it('gates refund on a successful payment', () => {
		const refund = contextualAction(buildOrderPages(), 'refund');

		expect(refund.command).toBe('paymentinvoice.paymentinvoice_order.refund');
		expect(refund.condition).toEqual({
			field: 'status',
			operator: 'equal',
			value: 'payment_success',
		});
	});

	/**
	 * The refund is filed against the business `order_id` the ordering system holds, never against
	 * this module's primary key — they are different strings, and sending the wrong one refunds
	 * nothing. The prompt prefills it from the record so it cannot be mistyped.
	 */
	it('collects the amount and prefills the business order id', () => {
		const refund = contextualAction(buildOrderPages(), 'refund');
		const fields = refund.prompt?.fields ?? [];

		expect(fields.map(field => field.name)).toEqual(['order_id', 'amount', 'content']);
		expect(fields[0].defaultFromField).toBe('order_id');
		expect(fields[0].required).toBe(true);
		expect(fields[1].required).toBe(true);
	});

	/**
	 * A badge renderer's `prefix` is what turns a stored enum value into an i18n key
	 * (`payment_success` → `order_status.payment_success`). Without it the raw snake_case value is
	 * displayed to the user.
	 */
	it('renders both status fields as prefixed badges', () => {
		const [page] = buildOrderPages();
		const props = page.props as {
			primary: { props: { fieldRenderers: Record<string, { prefix?: string }> } },
		};

		expect(props.primary.props.fieldRenderers.status?.prefix).toBe('order_status.');
		expect(props.primary.props.fieldRenderers.last_sync_status?.prefix).toBe('sync_status.');
	});
});

describe('Order transactions section', () => {
	/**
	 * `${id}` is a placeholder the table resolves from the route param at render time. A literal
	 * `${id}` reaching the backend would match nothing, and the wrong operator is rejected
	 * outright — the engine spells equality `=`, not `eq`.
	 */
	it('filters the transactions table by the order id', () => {
		const [page] = buildOrderPages();
		const tables = collectComponents(page, 'resourceTable');

		expect(tables.map(table => table.props?.schemaName))
			.toEqual([c.TRANSACTION_SCHEMA_NAME]);
		expect(tables[0].props?.filterGraph).toEqual({ if: ['order_id', '=', '${id}'] });
	});

	/**
	 * A transaction has no page of its own to link a row to. Pointing at one that does not exist
	 * would produce a dead link rather than an error.
	 */
	it('binds no write command and no row link on the transactions table', () => {
		const [page] = buildOrderPages();

		for (const table of collectComponents(page, 'resourceTable')) {
			expect(table.props?.linkRoutePath).toBeUndefined();
			expect(table.props?.updateSaveCommand).toBeUndefined();
			expect(table.props?.deleteCommand).toBeUndefined();
		}
	});
});

describe('Transaction page', () => {
	/**
	 * Transactions are written by the payment flow and carry the gateway's own record of what
	 * moved. Editing one would make this module's account disagree with the gateway's, which is
	 * exactly what the page exists to let someone check.
	 */
	it('is read-only', () => {
		const [page] = buildTransactionPages();
		const props = page.props as Record<string, unknown>;

		expect(props.createEnabled).toBeFalsy();
		expect(props.deleteCommand).toBeUndefined();
		expect(props.updateSaveCommand).toBeUndefined();
	});

	it('distinguishes payments from refunds by badge', () => {
		const [page] = buildTransactionPages();
		const renderers = (page.props as {
			fieldRenderers: Record<string, { colorMap?: Record<string, string> }>,
		}).fieldRenderers;

		expect(renderers.transaction_type?.colorMap).toEqual({ payment: 'blue', refund: 'orange' });
	});
});

describe('Invoice page', () => {
	/**
	 * Unlike an order, an invoice is authored: someone types the partner and its lines.
	 */
	it('allows an invoice to be created', () => {
		const [page] = buildInvoicePages();
		const props = page.props as {
			primary: { props: { createEnabled?: boolean } },
			secondary: { props: { standardActionCommands: Record<string, unknown> } },
		};

		expect(props.primary.props.createEnabled).toBe(true);
		expect(props.secondary.props.standardActionCommands.create)
			.toBe('core.resource.paymentinvoice_invoice.create');
	});

	/**
	 * Issuing is irreversible — it mints a number and freezes the totals — and the backend refuses
	 * a second attempt. Gating on `draft` means the button disappears rather than inviting one.
	 */
	it('gates issue on a draft', () => {
		const issue = contextualAction(buildInvoicePages(), 'issue');

		expect(issue.command).toBe('paymentinvoice.paymentinvoice_invoice.issue');
		expect(issue.condition).toEqual({ field: 'status', operator: 'equal', value: 'draft' });
	});

	/**
	 * Issue collects nothing: everything an issued invoice says is computed from what is already
	 * recorded against it, which is what makes the totals agree with the lines. A prompt here
	 * would offer someone the chance to disagree with them.
	 */
	it('asks for nothing before issuing', () => {
		expect(contextualAction(buildInvoicePages(), 'issue').prompt).toBeUndefined();
	});

	it('filters the lines table by the invoice id', () => {
		const [page] = buildInvoicePages();
		const tables = collectComponents(page, 'resourceTable');

		expect(tables.map(table => table.props?.schemaName))
			.toEqual([c.INVOICE_LINE_SCHEMA_NAME]);
		expect(tables[0].props?.filterGraph).toEqual({ if: ['invoice_id', '=', '${id}'] });
	});
});

type ContextualAction = {
	label: string,
	command: string,
	condition?: unknown,
	prompt?: { fields: { name: string, required?: boolean, defaultFromField?: string }[] },
};

/** Reads one contextual action off a split view's detail pane. */
function contextualAction(pages: PageNode[], name: string): ContextualAction {
	const [page] = pages;
	const props = page.props as {
		secondary: { props: { contextualActions?: Record<string, ContextualAction> } },
	};
	const action = props.secondary.props.contextualActions?.[name];

	expect(action, `contextual action '${name}' is missing`).toBeDefined();
	return action!;
}

/** Reads the schema name bound to each pane of a split view. */
function splitViewSchemas(pages: PageNode[]): { primary: string, secondary: string } {
	const [page] = pages;
	const props = page.props as {
		primary: { props: { schemaName: string } },
		secondary: { props: { schemaName: string } },
	};
	return { primary: props.primary.props.schemaName, secondary: props.secondary.props.schemaName };
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
		// A class instance has a prototype other than Object.prototype; it would not survive
		// the trip through JSON that a bundle boundary imposes.
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
