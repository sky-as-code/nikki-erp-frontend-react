import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/sales';
import { SalesFulfillmentRequestCommands } from '../../features/sales/salesFulfillmentRequest/commands';
import { SalesOrderCommands } from '../../features/sales/salesOrder/commands';
import { SalesOrderAdjustmentCommands } from '../../features/sales/salesOrderAdjustment/commands';
import { SalesOrderEventCommands } from '../../features/sales/salesOrderEvent/commands';
import { SalesOrderFulfillmentCommands } from '../../features/sales/salesOrderFulfillment/commands';
import { SalesOrderFulfillmentItemCommands } from '../../features/sales/salesOrderFulfillmentItem/commands';
import { SalesOrderLineCommands } from '../../features/sales/salesOrderLine/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** Amounts are in the order's own currency, which sets the decimal places shown. */
const SALES_ORDER_MONEY_RENDERER = { renderer: 'money', currencyField: 'currency_code' };

/** One colour map for the list badge and the detail status strip, so both read alike. */
const STATUS_BADGE = {
	renderer: 'enum',
	colorMap: {
		draft: 'gray',
		confirmed: 'blue',
		processing: 'indigo',
		completed: 'green',
		cancelled: 'red',
	},
	prefix: 'status.',
} as const;

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
		routePath: 'sales_order',
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
	return resourceListV2Props({
		schemaName: c.SALES_ORDER_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesOrderCommands.SEARCH,
		// Orders are created through `create_order`, which derives the channel from the sales point
		// rather than trusting the request; a plain create form would bypass that.
		createEnabled: false,
		fieldRenderers: {
			...buildSalesOrderStatusRenderers(),
			grand_total: SALES_ORDER_MONEY_RENDERER,
		},
	});
}

function buildSalesOrderMoneyRenderers() {
	return {
		subtotal: SALES_ORDER_MONEY_RENDERER,
		discount_total: SALES_ORDER_MONEY_RENDERER,
		tax_total: SALES_ORDER_MONEY_RENDERER,
		grand_total: SALES_ORDER_MONEY_RENDERER,
	};
}

/**
 * An enum renderer's `prefix` turns a stored enum value into an i18n key
 * (`partially_paid` → `payment_status.partially_paid`); without it the raw snake_case value reaches
 * the user. Colours mark what still needs action: `overpaid` is orange because change is owed, and
 * `pending` fulfilment is red because money taken with nothing dispensed is the failure that matters.
 */
function buildSalesOrderStatusRenderers() {
	return {
		status: STATUS_BADGE,
		payment_status: {
			renderer: 'enum',
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
			renderer: 'enum',
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
			renderer: 'enum',
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
	return resourceDetailV2Props({
		schemaName: c.SALES_ORDER_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		...statusStripProps(STATUS_BADGE),
		titleLvl1: { schemaField: 'order_number' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		// Read and update show the same fields in the same columns; an uneditable one reads `-`.
		stableFieldLayout: true,
		fieldRenderers: {
			...buildSalesOrderStatusRenderers(),
			...buildSalesOrderMoneyRenderers(),
		},
		standardActionCommands: {
			getById: SalesOrderCommands.GET_BY_ID,
			update: SalesOrderCommands.UPDATE,
		},
		contextualActions: buildSalesOrderActions(),
		// No `createNodes`: an order is raised through `create_order`, never through this form.
		childrenNodes: [buildSalesOrderFieldsSection()],
		relatedResources: [
			buildSalesOrderLinesResource(),
			buildSalesOrderAdjustmentsResource(),
			buildSalesOrderFulfillmentResource(),
			...buildSalesOrderKioskFulfillmentResources(),
			buildSalesOrderEventsResource(),
		],
	});
}

/**
 * The kiosk delivery of the sale and the stock held for it. The items table is filtered through
 * the fulfillment edge because an item carries no order id of its own, and each row links to the
 * warehouse reservation holding it, on the inventory module's own page.
 */
function buildSalesOrderKioskFulfillmentResources() {
	return [
		{
			label: 'sales_order_sections_kiosk_fulfillments',
			schemaName: c.SALES_ORDER_FULFILLMENT_SCHEMA_NAME,
			translationNs: c.SALES_MODULE,
			searchCommand: SalesOrderFulfillmentCommands.SEARCH,
			initialGraph: { if: ['sales_order_id', '=', '${id}'] },
			fields: ['fulfillment_type', 'fulfillment_status', 'target_outlet_id', 'reservation_expires_at',
				'max_attempts', 'failure_action'],
		},
		{
			label: 'sales_order_sections_reservations',
			schemaName: c.SALES_ORDER_FULFILLMENT_ITEM_SCHEMA_NAME,
			translationNs: c.SALES_MODULE,
			searchCommand: SalesOrderFulfillmentItemCommands.SEARCH,
			initialGraph: { if: ['fulfillment.sales_order_id', '=', '${id}'] },
			fields: ['product_variant_id', 'ordered_qty', 'fulfilled_qty', 'refunded_qty', 'item_status',
				'source_location_id', 'inventory_reservation_ref'],
			linkField: 'inventory_reservation_ref',
			// A leading slash names the owning module absolutely, so the link keeps working
			// wherever this section is embedded.
			linkRoutePath: '/commerce/inventory_stock_reservation',
		},
	];
}

/**
 * The status and money fields are `no_update` or computed on the backend; the form renders them
 * read-only from the schema.
 */
function buildSalesOrderFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.order',
			fields: ['order_number', 'status', 'sales_channel_id', 'sales_point_id',
				'customer_reference', 'currency_code'],
		}),
		resourceFormColumnNode({
			header: 'form.progress',
			fields: ['payment_status', 'fulfillment_status', 'invoice_status', 'confirmed_at',
				'completed_at', 'cancelled_at'],
		}),
		...buildSalesOrderDeadlineColumns(),
		resourceFormColumnNode({
			header: 'form.totals',
			fields: ['subtotal', 'discount_total', 'tax_total', 'grand_total'],
		}),
	]);
}

/**
 * The payment deadline, the automation the order was created under, and the notes. All read-only:
 * the deadline is set at create and never extended, the flags are the channel's settings frozen at
 * that moment, expiry is derived from the clock, and each note is written by its own action alone.
 */
function buildSalesOrderDeadlineColumns() {
	return [
		resourceFormColumnNode({
			header: 'form.expiry',
			fields: ['valid_until', 'is_expired', 'expired_at', 'auto_confirm_order', 'auto_confirm_refund'],
		}),
		resourceFormColumnNode({
			header: 'form.notes',
			fields: ['confirmation_note', 'cancellation_note', 'refund_note'],
		}),
	];
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
			actionCode: 'read',
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
			actionCode: 'cancel',
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.ORDER_STATUS_DRAFT, c.ORDER_STATUS_CONFIRMED, c.ORDER_STATUS_PROCESSING],
			},
			// `cancellation_note` is a field of the order itself, so the prompt can collect it; it
			// is stored only when given, never filled in by the system.
			prompt: {
				title: 'actions.cancel.title',
				fields: [{ name: 'cancellation_note' }],
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
			actionCode: 'confirm',
			condition: onlyOnDraft,
			prompt: {
				title: 'actions.confirm.title',
				fields: [{ name: 'confirmation_note' }],
			},
		},
		reprice: {
			label: 'actions.reprice',
			command: SalesOrderCommands.REPRICE,
			actionCode: 'update',
			condition: onlyOnDraft,
		},
		apply_voucher: {
			label: 'actions.apply_voucher',
			command: SalesOrderCommands.APPLY_VOUCHER,
			actionCode: 'apply_voucher',
			condition: onlyOnDraft,
		},
		manual_discount: {
			label: 'actions.manual_discount',
			command: SalesOrderCommands.MANUAL_DISCOUNT,
			actionCode: 'manual_discount',
			condition: onlyOnDraft,
		},
	};
}

/**
 * Lines are plain CRUD writes on `sales_order_line`; the backend has no add-line action. Call
 * `reprice` afterwards — it is deliberately not automatic, so adding three lines costs one repricing.
 */
function buildSalesOrderLinesResource() {
	return {
		label: 'sales_order_sections_lines',
		schemaName: c.SALES_ORDER_LINE_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesOrderLineCommands.SEARCH,
		initialGraph: { if: ['sales_order_id', '=', '${id}'] },
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
	};
}

/**
 * The adjustment chain. Read-only: the pricing engine replaces it wholesale on every repricing, so
 * a hand-written row would show a discount that was never given and then vanish.
 */
function buildSalesOrderAdjustmentsResource() {
	return {
		label: 'sales_order_sections_adjustments',
		schemaName: c.SALES_ORDER_ADJUSTMENT_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesOrderAdjustmentCommands.SEARCH,
		initialGraph: { if: ['sales_order_id', '=', '${id}'] },
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
	};
}

/**
 * What Inventory was asked to move. Shown on the order rather than as its own page, because a stuck
 * request is fixed upstream in Inventory. `accepted` is not `completed`: the gap between them is
 * money captured with goods not dispensed.
 */
function buildSalesOrderFulfillmentResource() {
	return {
		label: 'sales_order_sections_fulfillment',
		schemaName: c.SALES_FULFILLMENT_REQUEST_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesFulfillmentRequestCommands.SEARCH,
		initialGraph: { if: ['sales_order_id', '=', '${id}'] },
		fields: ['request_type', 'status', 'inventory_reference', 'failure_reason',
			'requested_at', 'completed_at'],
		fieldRenderers: {
			status: {
				renderer: 'enum',
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
	};
}

/**
 * Filtered by `sales_order_id`, not the polymorphic `entity_id` — the latter would show every event
 * whose subject happens to share an id shape with this order.
 */
function buildSalesOrderEventsResource() {
	return {
		label: 'sales_order_sections_events',
		schemaName: c.SALES_ORDER_EVENT_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesOrderEventCommands.SEARCH,
		initialGraph: { if: ['sales_order_id', '=', '${id}'] },
		fields: ['created_at', 'action', 'entity_type', 'from_status', 'to_status',
			'actor_id', 'reason'],
	};
}
