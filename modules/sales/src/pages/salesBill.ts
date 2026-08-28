import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesBillCommands } from '../features/salesBill/commands';
import { SalesBillLineCommands } from '../features/salesBillLine/commands';
import { SalesBillRelationCommands } from '../features/salesBillRelation/commands';
import { SalesFiscalRequestCommands } from '../features/salesFiscalRequest/commands';
import { SalesPaymentCommands } from '../features/salesPayment/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * One order can carry several bills, and every order line's quantity must be allocated exactly
 * once across the set. That is why splitting and merging are actions rather than edits.
 */
export function buildSalesBillPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesBillListProps(),
		secondary: buildSalesBillDetailProps(),
	});

	return [definePage({
		routePath: 'sales_bills',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesBillListProps() {
	return resourceListProps({
		schemaName: c.SALES_BILL_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesBillCommands.SEARCH,
		// A bill created here would carry no allocations and so bill for nothing.
		createEnabled: false,
		fieldRenderers: {
			status: {
				renderer: 'badge',
				colorMap: { open: 'blue', settled: 'green', cancelled: 'gray' },
				prefix: 'status.',
			},
			payment_status: {
				renderer: 'badge',
				colorMap: {
					unpaid: 'red',
					partially_paid: 'orange',
					paid: 'green',
					overpaid: 'orange',
					refunded: 'gray',
					partially_refunded: 'gray',
				},
				prefix: 'payment_status.',
			},
		},
	});
}

function buildSalesBillDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_BILL_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'bill_number' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesBillCommands.GET_BY_ID,
			update: SalesBillCommands.UPDATE,
		},
		contextualActions: buildSalesBillActions(),
		childrenNodes: [
			buildSalesBillFieldsSection(),
			...buildSalesBillLinesSection(),
			...buildSalesBillPaymentsSection(),
			...buildSalesBillFiscalSection(),
			...buildSalesBillLineageSection(),
		],
	});
}

/** `total_amount` here is the same figure the order calls `grand_total`. */
function buildSalesBillFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.bill',
				fields: ['bill_number', 'sales_order_id', 'status', 'payment_status',
					'currency_code'],
			}),
			resourceFormColumnNode({
				header: 'form.totals',
				fields: ['subtotal', 'discount_total', 'tax_total', 'total_amount'],
			}),
			resourceFormColumnNode({
				header: 'form.other_information',
				fields: ['settled_at', 'cancelled_at', 'org_id', 'created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * `split` and `merge` are registered as commands but not offered as buttons: both need a payload a
 * prompt cannot collect — an allocation map, and a multi-selection of bills.
 */
function buildSalesBillActions() {
	return {
		/** Open bills only: a settled one needs no payment, a cancelled one is not owed. */
		pay: {
			label: 'actions.pay',
			command: SalesBillCommands.PAY,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.BILL_STATUS_OPEN,
			},
		},
		/**
		 * Settlement is exact equality with no tolerance: it succeeds only once the captured total
		 * matches to the last unit. Offered on any open bill rather than gated on `payment_status`,
		 * because the backend's refusal names the shortfall.
		 */
		settle: {
			label: 'actions.settle',
			command: SalesBillCommands.SETTLE,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.BILL_STATUS_OPEN,
			},
		},
	};
}

/**
 * Read-only: allocations are written by splitting and merging, and a writable one could break the
 * exactly-once invariant, billing goods twice or not at all.
 */
function buildSalesBillLinesSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_bill_sections_lines',
				translationNs: c.SALES_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.SALES_BILL_LINE_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesBillLineCommands.SEARCH,
				filterGraph: { if: ['sales_bill_id', '=', '${id}'] },
				fields: ['sales_order_line_id', 'quantity', 'allocated_net_amount',
					'allocated_tax_amount', 'allocated_total_amount'],
			})],
		),
	];
}

/**
 * Only `captured` counts toward settlement; an `authorized` row is a hold the provider may still
 * release, so the badge distinguishes them rather than showing both as success.
 */
function buildSalesBillPaymentsSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_bill_sections_payments',
				translationNs: c.SALES_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.SALES_PAYMENT_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesPaymentCommands.SEARCH,
				filterGraph: { if: ['sales_bill_id', '=', '${id}'] },
				fields: ['paid_at', 'payment_method_code_snapshot', 'amount', 'currency_code',
					'status', 'external_transaction_id'],
				fieldRenderers: {
					status: {
						renderer: 'badge',
						colorMap: {
							pending: 'orange',
							authorized: 'blue',
							captured: 'green',
							failed: 'red',
							cancelled: 'gray',
						},
						prefix: 'payment_state.',
					},
				},
			})],
		),
	];
}

function buildSalesBillFiscalSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_bill_sections_fiscal',
				translationNs: c.SALES_MODULE,
				expanded: false,
			},
			[resourceTableNode({
				schemaName: c.SALES_FISCAL_REQUEST_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesFiscalRequestCommands.SEARCH,
				filterGraph: { if: ['sales_bill_id', '=', '${id}'] },
				fields: ['requested_at', 'intent', 'status', 'provider_reference', 'attempt_count',
					'last_error'],
				linkRoutePath: 'sales_fiscal_requests',
				linkField: 'id',
				fieldRenderers: {
					status: {
						renderer: 'badge',
						colorMap: {
							pending: 'orange',
							issued: 'green',
							failed: 'red',
							cancelled: 'gray',
						},
						prefix: 'fiscal_status.',
					},
				},
			})],
		),
	];
}

/**
 * Read-only: a writable lineage row could fabricate a payment trail between unrelated bills.
 * Filtered on `source_bill_id`, the outgoing direction.
 */
function buildSalesBillLineageSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_bill_sections_lineage',
				translationNs: c.SALES_MODULE,
				expanded: false,
			},
			[resourceTableNode({
				schemaName: c.SALES_BILL_RELATION_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesBillRelationCommands.SEARCH,
				filterGraph: { if: ['source_bill_id', '=', '${id}'] },
				fields: ['relation_type', 'target_bill_id', 'created_at'],
				fieldRenderers: {
					relation_type: {
						renderer: 'badge',
						colorMap: { split_into: 'blue', merged_into: 'indigo' },
						prefix: 'relation_type.',
					},
				},
			})],
		),
	];
}
