import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	resourceTableNode, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesFulfillmentRequestCommands } from '../features/salesFulfillmentRequest/commands';
import { SalesOrderCommands } from '../features/salesOrder/commands';
import { SalesOrderAdjustmentCommands } from '../features/salesOrderAdjustment/commands';
import { SalesOrderEventCommands } from '../features/salesOrderEvent/commands';
import { SalesOrderLineCommands } from '../features/salesOrderLine/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The sales order. One route, not two: unlike purchase's RFQ/PO pair, a Sales quotation is a
 * separate resource with its own table and numbering, so it gets its own page.
 */
export function buildSalesOrderPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesOrderListProps(),
		secondary: buildSalesOrderDetailProps(),
	});

	return [definePage({
		routePath: 'sales_orders',
		template: splitView.template,
		props: splitView.props,
	})];
}

/**
 * No `archiveCommand`: an order's lifecycle is its status, and archiving one would hide a fiscal
 * record. The four status columns are independent — a sale can be completed and unpaid, or paid and
 * unfulfilled — so collapsing them into one would hide states somebody needs to act on.
 */
function buildSalesOrderListProps() {
	return resourceListProps({
		schemaName: c.SALES_ORDER_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesOrderCommands.SEARCH,
		// Orders are created through `create_order`, which derives the channel from the sales point
		// rather than trusting the request; a plain create form would bypass that.
		createEnabled: false,
		fieldRenderers: buildSalesOrderStatusRenderers(),
	});
}

/**
 * A badge renderer's `prefix` turns a stored enum value into an i18n key
 * (`partially_paid` → `payment_status.partially_paid`); without it the raw snake_case value reaches
 * the user. Colours mark what still needs action: `overpaid` is orange because change is owed, and
 * `pending` fulfilment is red because money taken with nothing dispensed is the failure that matters.
 */
function buildSalesOrderStatusRenderers() {
	return {
		status: {
			renderer: 'badge',
			colorMap: {
				draft: 'gray',
				confirmed: 'blue',
				processing: 'indigo',
				completed: 'green',
				cancelled: 'red',
			},
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
		fulfillment_status: {
			renderer: 'badge',
			colorMap: {
				pending: 'red',
				not_required: 'gray',
				partially_fulfilled: 'orange',
				fulfilled: 'green',
				returned: 'gray',
				partially_returned: 'orange',
			},
			prefix: 'fulfillment_status.',
		},
		invoice_status: {
			renderer: 'badge',
			colorMap: {
				not_requested: 'gray',
				requested: 'blue',
				issued: 'green',
				failed: 'red',
				cancelled: 'gray',
			},
			prefix: 'invoice_status.',
		},
	};
}

function buildSalesOrderDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_ORDER_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'order_number' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesOrderCommands.GET_BY_ID,
			update: SalesOrderCommands.UPDATE,
		},
		contextualActions: buildSalesOrderActions(),
		// No `createNodes`: an order is raised through `create_order`, never through this form.
		childrenNodes: [
			buildSalesOrderFieldsSection(),
			...buildSalesOrderLinesSection(),
			...buildSalesOrderAdjustmentsSection(),
			...buildSalesOrderFulfillmentSection(),
			...buildSalesOrderEventsSection(),
		],
	});
}

/**
 * The status and money fields are `no_update` or computed on the backend; the form renders them
 * read-only from the schema.
 */
function buildSalesOrderFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.SALES_MODULE,
		tabs: [
			{
				key: 'order',
				header: 'form.order',
				content: resourceFormColumnNode({
					header: 'form.order',
					fields: ['order_number', 'status', 'sales_channel_id', 'sales_point_id',
						'customer_reference', 'currency_code'],
				}),
			},
			{
				key: 'progress',
				header: 'form.progress',
				content: resourceFormColumnNode({
					header: 'form.progress',
					fields: ['payment_status', 'fulfillment_status', 'invoice_status', 'confirmed_at',
						'completed_at', 'cancelled_at'],
				}),
			},
			{
				key: 'totals',
				header: 'form.totals',
				content: resourceFormColumnNode({
					header: 'form.totals',
					fields: ['subtotal', 'discount_total', 'tax_total', 'grand_total'],
				}),
			},
			{
				key: 'other',
				header: 'form.other_information',
				content: resourceFormColumnNode({
					header: 'form.other_information',
					fields: ['external_reference', 'crm_opportunity_reference', 'exchange_of_return_id',
						'org_id', 'created_at', 'updated_at'],
				}),
			},
		],
	});
}

/**
 * Each condition decides only what to offer; the backend is the authority on what is permitted.
 * Status literals come from `constants` because a condition naming a status that does not exist
 * silently never offers its action.
 */
function buildSalesOrderActions() {
	return {
		...buildDraftOnlyActions(),
		// Offered from every status but cancelled: somebody disputing a receipt for a completed
		// sale is exactly who needs this.
		explain_price: {
			label: 'actions.explain_price',
			command: SalesOrderCommands.EXPLAIN_PRICE,
			condition: {
				field: 'status',
				operator: 'not_equal' as const,
				value: c.ORDER_STATUS_CANCELLED,
			},
		},
		// Live statuses only. The backend additionally refuses a paid or fulfilled order, naming a
		// refund or a return; that refusal is left reachable rather than pre-empted by a narrower
		// condition, because a hidden button tells the operator nothing.
		cancel: {
			label: 'actions.cancel',
			command: SalesOrderCommands.CANCEL,
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.ORDER_STATUS_DRAFT, c.ORDER_STATUS_CONFIRMED, c.ORDER_STATUS_PROCESSING],
			},
		},
	};
}

/**
 * Draft-only, sharing one condition: a confirmed order is frozen, and repricing or discounting it
 * would move a total the customer has already been charged — the correction is a return or refund.
 * Confirm is here for the mirror reason: it has side effects, so a second one is refused rather
 * than treated as idempotent, which would redeem the voucher twice.
 */
function buildDraftOnlyActions() {
	const onlyOnDraft = {
		field: 'status',
		operator: 'equal' as const,
		value: c.ORDER_STATUS_DRAFT,
	};

	return {
		confirm: {
			label: 'actions.confirm',
			command: SalesOrderCommands.CONFIRM,
			condition: onlyOnDraft,
		},
		reprice: {
			label: 'actions.reprice',
			command: SalesOrderCommands.REPRICE,
			condition: onlyOnDraft,
		},
		apply_voucher: {
			label: 'actions.apply_voucher',
			command: SalesOrderCommands.APPLY_VOUCHER,
			condition: onlyOnDraft,
		},
		manual_discount: {
			label: 'actions.manual_discount',
			command: SalesOrderCommands.MANUAL_DISCOUNT,
			condition: onlyOnDraft,
		},
	};
}

/**
 * Lines are plain CRUD writes on `sales_order_line`; the backend has no add-line action. Call
 * `reprice` afterwards — it is deliberately not automatic, so adding three lines costs one repricing.
 */
function buildSalesOrderLinesSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_order_sections_lines',
				translationNs: c.SALES_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.SALES_ORDER_LINE_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesOrderLineCommands.SEARCH,
				filterGraph: { if: ['sales_order_id', '=', '${id}'] },
				fields: ['line_number', 'line_type', 'product_name_snapshot', 'ordered_quantity',
					'uom_id', 'effective_unit_price', 'discount_amount', 'net_amount', 'tax_amount',
					'final_amount'],
				fieldRenderers: {
					// A reward line's price is zero and a combo line's price belongs to the combo,
					// so the badge is what explains a row whose money columns read oddly.
					line_type: {
						renderer: 'badge',
						colorMap: {
							product: 'gray',
							combo: 'indigo',
							promotion_reward: 'green',
						},
						prefix: 'line_type.',
					},
				},
			})],
		),
	];
}

/**
 * The adjustment chain. Read-only: the pricing engine replaces it wholesale on every repricing, so
 * a hand-written row would show a discount that was never given and then vanish.
 */
function buildSalesOrderAdjustmentsSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_order_sections_adjustments',
				translationNs: c.SALES_MODULE,
				expanded: false,
			},
			[resourceTableNode({
				schemaName: c.SALES_ORDER_ADJUSTMENT_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesOrderAdjustmentCommands.SEARCH,
				filterGraph: { if: ['sales_order_id', '=', '${id}'] },
				fields: ['sequence', 'adjustment_type', 'description', 'base_amount',
					'adjustment_amount'],
				fieldRenderers: {
					adjustment_type: {
						renderer: 'badge',
						colorMap: {
							combo_price: 'indigo',
							conditional_price: 'blue',
							percentage_discount: 'green',
							fixed_discount: 'green',
							voucher: 'grape',
							manual_discount: 'orange',
							rounding: 'gray',
						},
						prefix: 'adjustment_type.',
					},
				},
			})],
		),
	];
}

/**
 * What Inventory was asked to move. Shown on the order rather than as its own page, because a stuck
 * request is fixed upstream in Inventory. `accepted` is not `completed`: the gap between them is
 * money captured with goods not dispensed.
 */
function buildSalesOrderFulfillmentSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_order_sections_fulfillment',
				translationNs: c.SALES_MODULE,
				expanded: false,
			},
			[resourceTableNode({
				schemaName: c.SALES_FULFILLMENT_REQUEST_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesFulfillmentRequestCommands.SEARCH,
				filterGraph: { if: ['sales_order_id', '=', '${id}'] },
				fields: ['request_type', 'status', 'inventory_reference', 'failure_reason',
					'requested_at', 'completed_at'],
				fieldRenderers: {
					status: {
						renderer: 'badge',
						colorMap: {
							pending: 'orange',
							accepted: 'blue',
							completed: 'green',
							rejected: 'red',
							cancelled: 'gray',
						},
						prefix: 'status.',
					},
				},
			})],
		),
	];
}

/**
 * Filtered by `sales_order_id`, not the polymorphic `entity_id` — the latter would show every event
 * whose subject happens to share an id shape with this order.
 */
function buildSalesOrderEventsSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_order_sections_events',
				translationNs: c.SALES_MODULE,
				expanded: false,
			},
			[resourceTableNode({
				schemaName: c.SALES_ORDER_EVENT_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesOrderEventCommands.SEARCH,
				filterGraph: { if: ['sales_order_id', '=', '${id}'] },
				fields: ['created_at', 'action', 'entity_type', 'from_status', 'to_status',
					'actor_id', 'reason'],
			})],
		),
	];
}
