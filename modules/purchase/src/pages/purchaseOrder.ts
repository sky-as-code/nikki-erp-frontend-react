import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps,
	resourceTableNode, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { AuditEventCommands } from '../features/auditEvent/commands';
import { PurchaseOrderCommands } from '../features/purchaseOrder/commands';
import { PurchaseOrderLineCommands } from '../features/purchaseOrderLine/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Two routes onto ONE resource (PUR-R1).
 *
 * A purchase order starts life as a request for quotation and becomes a committed order on
 * confirmation â€” same row, same id, different `status`. So `requests_for_quotation` and
 * `purchase_orders` are the same page under two filters, the way Inventory's cycle-count worklist
 * is the balance list filtered by date. Modelling them as two resources would mean an order
 * changing its identity at confirmation, and every link to it breaking.
 *
 * The detail pane is shared between them: it is the same document either way, and a user who
 * confirms an RFQ should stay on the record rather than have it vanish from under them.
 */
export function buildPurchaseOrderPages(): PageNode[] {
	return [
		definePage({ routePath: 'requests_for_quotation', ...splitView(QUOTATION_FILTER, true) }),
		definePage({ routePath: 'purchase_orders', ...splitView(COMMITTED_FILTER, false) }),
	];
}

/**
 * The quotation stages: an order still being negotiated, before anyone has committed.
 *
 * `to_approve` belongs here rather than with the committed orders. The business has not committed
 * until someone approves, so an order awaiting approval is still a quotation â€” and the buyer
 * chasing it needs it on the screen they work from.
 */
const QUOTATION_FILTER = {
	if: ['status', 'in', [c.ORDER_STATUS_RFQ, c.ORDER_STATUS_RFQ_SENT, c.ORDER_STATUS_TO_APPROVE]],
};

/**
 * The committed orders, and the cancelled ones.
 *
 * Cancelled is included deliberately: a cancelled order is the record that the business committed
 * and then stopped, which is a purchasing question rather than a quotation one. Excluding it would
 * make cancelled orders reachable only by direct link.
 */
const COMMITTED_FILTER = {
	if: ['status', 'in', [c.ORDER_STATUS_PURCHASE_ORDER, c.ORDER_STATUS_CANCELLED]],
};

/**
 * Merge is the module's one collection-level action: it takes several orders and has no single one
 * to name, so it belongs on the list toolbar rather than among the detail page's contextual
 * actions, which all act on the record they are open on.
 *
 * It is offered on the QUOTATION route only. The backend accepts a merge of `rfq` and `rfq_sent`
 * orders and refuses anything else by name, so putting it on the committed-orders toolbar would be
 * a button that never once succeeds.
 *
 * `runCommand` publishes `{ ids }` from the selected rows, which is what `mergeRequest` reads. The
 * backend picks the target itself â€” the oldest by deadline â€” and refuses orders differing in
 * vendor, currency or agreement, so no compatibility check is duplicated here.
 */
const MERGE_ACTION = {
	label: 'actions.merge',
	command: PurchaseOrderCommands.MERGE,
	requireSelection: true,
	supportMultiple: true,
	testId: 'merge',
};

function splitView(filterGraph: Record<string, unknown>, mergeable: boolean) {
	const view = resourceSplitViewProps({
		primary: buildOrderListProps(filterGraph, mergeable),
		secondary: buildOrderDetailProps(),
	});
	return { template: view.template, props: view.props };
}

/**
 * The order list, filtered to one half of the lifecycle.
 *
 * Create is enabled: unlike a payment order, a purchase order IS authored â€” a buyer raises a
 * request for quotation by hand. Delete is absent from the toolbar even though the backend permits
 * it from `cancelled` (BR 24), because a list-level delete invites removing the record of a
 * purchase the business committed to; the guarded path is to cancel, which leaves the trail.
 */
function buildOrderListProps(filterGraph: Record<string, unknown>, mergeable: boolean) {
	return resourceListProps({
		schemaName: c.PURCHASE_ORDER_SCHEMA_NAME,
		translationNs: c.PURCHASE_MODULE,
		linkField: 'id',
		searchCommand: PurchaseOrderCommands.SEARCH,
		createEnabled: true,
		filterGraph,
		extraActions: mergeable ? [MERGE_ACTION] : [],
		fieldRenderers: {
			// The colours track how far the commitment got: grey while it is only a request, blue
			// once it is with the vendor, orange while it waits on an approver, green once the
			// business has committed, red when it was called off.
			status: {
				renderer: 'badge',
				colorMap: {
					rfq: 'gray',
					rfq_sent: 'blue',
					to_approve: 'orange',
					purchase_order: 'green',
					cancelled: 'red',
				},
				prefix: 'status.',
			},
			priority: {
				renderer: 'badge',
				colorMap: { normal: 'gray', urgent: 'red' },
				prefix: 'priority.',
			},
		},
	});
}

/**
 * The order detail form.
 *
 * The three totals sit in their own section and are computed by the backend from the lines
 * ([PUR-014]) â€” they are shown because they are what the document is for, and they are never
 * typed. Same for `approved_by` / `approved_at`, which the approve action stamps.
 */
function buildOrderDetailProps() {
	return resourceDetailProps({
		schemaName: c.PURCHASE_ORDER_SCHEMA_NAME,
		translationNs: c.PURCHASE_MODULE,
		titleLvl1: { schemaField: 'code' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: PurchaseOrderCommands.GET_BY_ID,
			create: PurchaseOrderCommands.CREATE,
			update: PurchaseOrderCommands.UPDATE,
		},
		contextualActions: buildOrderActions(),
		createNodes: [buildPurchaseOrderFieldsSection()],
		childrenNodes: [buildPurchaseOrderFieldsSection(), ...buildLinesSection(), ...buildAuditSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildPurchaseOrderFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.PURCHASE_MODULE,
		tabs: [
			{
				key: 'general',
				header: 'form.generalInformation',
				content: resourceFormColumnNode({
					header: 'form.generalInformation',
					// `code` is allocated by the backend; `vendor_reference` is the vendor's own number for
					// the same document. A support conversation may start from either.
					fields: ['code', 'status', 'vendor_id', 'vendor_reference', 'buyer_id', 'currency_id',
						'priority', 'org_id'],
				}),
			},
			{
				key: 'terms',
				header: 'form.terms',
				content: resourceFormColumnNode({
					header: 'form.terms',
					fields: ['order_deadline', 'expected_arrival', 'terms_conditions', 'agreement_id',
						'source_reference'],
				}),
			},
			{
				key: 'totals',
				header: 'form.totals',
				content: resourceFormColumnNode({
					header: 'form.totals',
					// Computed from the lines by the backend. Read-only.
					fields: ['untaxed_amount', 'tax_amount', 'total_amount'],
				}),
			},
			{
				key: 'approval',
				header: 'form.approval',
				content: resourceFormColumnNode({
					header: 'form.approval',
					// Set by confirmation and the approve action, never typed.
					fields: ['approval_required', 'approved_by', 'approved_at', 'confirmed_at'],
				}),
			},
			{
				key: 'audit',
				header: 'form.audit',
				content: resourceFormColumnNode({
					header: 'form.audit',
					fields: ['is_locked', 'vendor_acknowledged', 'sourcing_group_id', 'created_at',
						'updated_at'],
				}),
			},
		],
	});
}
/**
 * The lifecycle actions, each gated on the statuses it actually makes sense in.
 *
 * The conditions are deliberately narrower than the backend's guard rails in places. A button
 * offered on a record the backend will refuse invites the user to attempt something that cannot
 * work; one hidden on a record where it would have worked is merely a missing shortcut. The
 * backend remains the authority either way â€” these conditions decide what to *offer*, never what
 * is permitted.
 *
 * Only one condition per action: `conditionExpressionSchema` is a single field test, so an action
 * needing two (unlock, which wants `is_locked` AND a committed status) is gated on the field that
 * matters most.
 *
 * Split across three functions to stay inside the line budget, along seams that are real: this one
 * moves the order forward, `buildLockActions` acts on the lock flag, and `buildSourcingActions`
 * concerns the set of competing quotations rather than this order alone.
 */
function buildOrderActions() {
	return {
		...buildLockActions(),
		...buildSourcingActions(),
		...buildPricingActions(),
		// Sending turns a draft into a quotation with a vendor, so only the draft offers it.
		send: {
			label: 'actions.send',
			command: PurchaseOrderCommands.SEND,
			condition: { field: 'status', operator: 'equal' as const, value: c.ORDER_STATUS_RFQ },
		},
		/**
		 * Confirm is offered on both quotation stages, since a buyer may commit without formally
		 * sending first.
		 *
		 * It collects nothing. An order with open alternatives needs an `alternative_choice`
		 * saying what becomes of its siblings (Â§31), but a prompt cannot ask for it: the dialog
		 * narrows the page's OWN schema to the named fields, and `alternative_choice` is an action
		 * parameter rather than a field of the order. Naming it here would render an empty dialog
		 * that submits nothing.
		 *
		 * That is survivable rather than broken. The backend answers a confirm with open
		 * alternatives by returning the warning instead of committing, so the user is told what is
		 * in the way; it is only the second step â€” answering it â€” that has no home yet. See the
		 * note in `pages.test.ts`.
		 */
		confirm: {
			label: 'actions.confirm',
			command: PurchaseOrderCommands.CONFIRM,
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.ORDER_STATUS_RFQ, c.ORDER_STATUS_RFQ_SENT],
			},
		},
		// Only ever reached when the organization's configuration routed the order here.
		approve: {
			label: 'actions.approve',
			command: PurchaseOrderCommands.APPROVE,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.ORDER_STATUS_TO_APPROVE,
			},
		},
		/**
		 * Cancel is offered from every status except cancelled itself â€” including
		 * `purchase_order`, which BR 23 makes a point of not being terminal.
		 *
		 * No prompt: the backend's cancel takes an OPTIONAL reason, and `reason` is not a field of
		 * the order â€” it belongs to the transition, and is stored on the audit event. A prompt
		 * naming it would render an empty dialog, so the action fires directly and the audit event
		 * records the cancellation without a note.
		 */
		cancel: {
			label: 'actions.cancel',
			command: PurchaseOrderCommands.CANCEL,
			condition: {
				field: 'status',
				operator: 'not_equal' as const,
				value: c.ORDER_STATUS_CANCELLED,
			},
		},
		acknowledge: {
			label: 'actions.acknowledge',
			command: PurchaseOrderCommands.ACKNOWLEDGE,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.ORDER_STATUS_PURCHASE_ORDER,
			},
		},
	};
}

/**
 * Locking and unlocking, gated on the flag rather than on a status: they act on the flag, and
 * which status the order is in is the backend's business.
 */
function buildLockActions() {
	return {
		lock: {
			label: 'actions.lock',
			command: PurchaseOrderCommands.LOCK,
			condition: { field: 'is_locked', operator: 'not_equal' as const, value: true },
		},
		/**
		 * Unlocking reopens terms already agreed with a vendor, which is why the backend REFUSES
		 * one without a reason â€” `purchase_order.unlock_reason_required`.
		 *
		 * This is the one action the current prompt cannot serve, and it is deliberately still
		 * offered rather than hidden. A prompt narrows the page's own schema to the named fields
		 * and drops the rest, and `reason` is not a field of the order â€” it belongs to the
		 * transition and is stored on the audit event â€” so a dialog naming it would render empty
		 * and submit nothing.
		 *
		 * Offering it means the user gets the backend's violation, which names the missing reason.
		 * Hiding it would leave a locked order with no visible way to reopen it and no explanation
		 * anywhere. Neither is good; the first is honest. Closing this needs a prompt that can
		 * collect a field the resource schema does not declare â€” see `pages.test.ts`, which pins
		 * the gap so it cannot be quietly forgotten.
		 */
		unlock: {
			label: 'actions.unlock',
			command: PurchaseOrderCommands.UNLOCK,
			condition: { field: 'is_locked', operator: 'equal' as const, value: true },
		},
	};
}

/**
 * The actions that concern the set of competing quotations rather than this order's own progress.
 */
/**
 * Repricing, kept apart from the lifecycle actions because it is not one.
 *
 * Every action in `buildOrderActions` moves the order to another status; this one changes what the
 * order will PAY and leaves its status exactly where it was. Grouping it with confirm and cancel
 * would suggest a progression it is not part of.
 */
function buildPricingActions() {
	return {
		/**
		 * Offered on the three draft statuses and nowhere else.
		 *
		 * The backend refuses a confirmed order outright, and rightly: the vendor holds a copy of
		 * that document, and moving its prices would make the two disagree. Offering the button
		 * there would invite an attempt that cannot work.
		 *
		 * `to_approve` IS offered — an order waiting on an approver is still a draft, and the
		 * approver is precisely the person who might want the prices current before deciding.
		 *
		 * A locked draft is refused by the backend too, but the condition cannot say so: only one
		 * field test is allowed per action, and status is the one that matters more.
		 */
		reprice: {
			label: 'actions.reprice',
			command: PurchaseOrderCommands.REPRICE,
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.ORDER_STATUS_RFQ, c.ORDER_STATUS_RFQ_SENT, c.ORDER_STATUS_TO_APPROVE],
			},
		},
	};
}

function buildSourcingActions() {
	return {
		// Always available: copying a document is safe whatever state the original is in, and
		// copying a cancelled order to try again is a normal thing to want. It sits here because
		// duplicating produces a second quotation, which is what an alternative also is.
		duplicate: {
			label: 'actions.duplicate',
			command: PurchaseOrderCommands.DUPLICATE,
		},
		/**
		 * An alternative is the same requirement quoted by a different vendor, so it only makes
		 * sense while the order is still a quotation. The prompt collects the vendor to quote â€”
		 * `vendor_id` IS a field of the order schema, which is what lets this one work where the
		 * reason prompts cannot.
		 */
		create_alternative: {
			label: 'actions.create_alternative',
			command: PurchaseOrderCommands.CREATE_ALTERNATIVE,
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.ORDER_STATUS_RFQ, c.ORDER_STATUS_RFQ_SENT],
			},
			prompt: {
				title: 'actions.create_alternative',
				fields: [{ name: 'vendor_id', required: true }],
			},
		},
		// Offered only once the order is actually in a sourcing group: comparing alternatives that
		// do not exist would return an empty comparison rather than an error.
		compare_alternatives: {
			label: 'actions.compare_alternatives',
			command: PurchaseOrderCommands.COMPARE_ALTERNATIVES,
			condition: { field: 'sourcing_group_id', operator: 'exists' as const },
		},
	};
}

/**
 * The order's lines, as a related-records table.
 *
 * Writable, unlike every other table in this module: the lines ARE the order, and a buyer edits
 * them here. Each write recomputes the header's totals on the backend inside the same transaction
 * ([PUR-014]), so nothing on this side keeps them in step.
 *
 * `linkRoutePath` is absent because a line has no page of its own â€” it means nothing outside the
 * order that carries it.
 */
function buildLinesSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'purchase_order_sections_lines', translationNs: c.PURCHASE_MODULE, expanded: true },
			[resourceTableNode({
				schemaName: c.PURCHASE_ORDER_LINE_SCHEMA_NAME,
				translationNs: c.PURCHASE_MODULE,
				searchCommand: PurchaseOrderLineCommands.SEARCH,
				filterGraph: { if: ['purchase_order_id', '=', '${id}'] },
				fields: ['sequence', 'line_type', 'product_variant_id', 'description', 'quantity',
					'uom_id', 'unit_price', 'discount_percent', 'subtotal', 'tax_amount', 'total'],
				fieldRenderers: {
					// Only a `product` line carries money; the other three are structure and text,
					// which the totals engine skips. The badge is what makes that visible in a
					// table where the money columns are otherwise just empty.
					line_type: {
						renderer: 'badge',
						colorMap: {
							product: 'blue',
							section: 'gray',
							subsection: 'gray',
							note: 'gray',
						},
						prefix: 'line_type.',
					},
				},
			})],
		),
	];
}

/**
 * The order's audit trail, as a read-only related-records table.
 *
 * Collapsed by default: it is what you consult when a question arises about who did what, not
 * what you read on the way past. Filtered by `entity_id` rather than an order-specific column,
 * because one audit table records transitions of both orders and agreements.
 */
function buildAuditSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'purchase_order_sections_auditTrail', translationNs: c.PURCHASE_MODULE },
			[resourceTableNode({
				schemaName: c.AUDIT_EVENT_SCHEMA_NAME,
				translationNs: c.PURCHASE_MODULE,
				searchCommand: AuditEventCommands.SEARCH,
				filterGraph: { if: ['entity_id', '=', '${id}'] },
				fields: ['created_at', 'action', 'from_status', 'to_status', 'actor_id', 'reason'],
			})],
		),
	];
}
