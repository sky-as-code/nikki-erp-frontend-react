import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { AgreementCommands } from '../features/agreement/commands';
import { AgreementLineCommands } from '../features/agreementLine/commands';
import { PurchaseOrderCommands } from '../features/purchaseOrder/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Purchase agreements: blanket orders and reusable templates, on one page.
 *
 * Unlike the order, this is a single route. The two `agreement_type` values are variants of the
 * same standing arrangement rather than stages of a lifecycle, so they belong in one list a user
 * can filter, not behind two menu entries.
 */
export function buildAgreementPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildAgreementListProps(),
		secondary: buildAgreementDetailProps(),
	});

	return [definePage({
		routePath: 'agreements',
		template: splitView.template,
		props: splitView.props,
	})];
}

/**
 * The agreement list.
 *
 * `archiveCommand` is bound here and on no other page in this module: an agreement is the one
 * purchase resource that IS archivable, because a standing arrangement can fall out of use without
 * being cancelled. Archiving takes it out of the working set while leaving the orders drawn
 * against it intact â€” which cancelling would not.
 */
function buildAgreementListProps() {
	return resourceListProps({
		schemaName: c.AGREEMENT_SCHEMA_NAME,
		translationNs: c.PURCHASE_MODULE,
		linkField: 'id',
		searchCommand: AgreementCommands.SEARCH,
		createEnabled: true,
		archiveCommand: AgreementCommands.SET_IS_ARCHIVED,
		fieldRenderers: {
			// Closed and cancelled are deliberately different colours: a closed agreement ran its
			// course and the orders drawn against it stand, where a cancelled one was called off.
			status: {
				renderer: 'badge',
				colorMap: {
					draft: 'gray',
					confirmed: 'green',
					closed: 'blue',
					cancelled: 'red',
				},
				prefix: 'agreement_status.',
			},
			agreement_type: {
				renderer: 'badge',
				colorMap: { blanket_order: 'indigo', purchase_template: 'gray' },
				prefix: 'agreement_type.',
			},
		},
	});
}

function buildAgreementDetailProps() {
	return resourceDetailProps({
		schemaName: c.AGREEMENT_SCHEMA_NAME,
		translationNs: c.PURCHASE_MODULE,
		titleLvl1: { schemaField: 'code' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: AgreementCommands.GET_BY_ID,
			create: AgreementCommands.CREATE,
			update: AgreementCommands.UPDATE,
			archive: AgreementCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildAgreementActions(),
		createNodes: [buildAgreementFieldsSection()],
		childrenNodes: [buildAgreementFieldsSection(), ...buildAgreementLinesSection(), ...buildDrawnOrdersSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildAgreementFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.other_information',
				// `vendor_id` is optional here, unlike on an order: a template may be drafted before
				// anyone has chosen who to buy from.
				fields: ['code', 'reference', 'agreement_type', 'status', 'vendor_id', 'buyer_id',
					'currency_id', 'org_id'],
			}),
			resourceFormColumnNode({
				header: 'form.terms',
				fields: ['start_date', 'end_date', 'description'],
			}),
			resourceFormColumnNode({
				header: 'form.other_information',
				fields: ['is_archived', 'created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * The four lifecycle actions.
 *
 * None takes a prompt. The agreement's cancel accepts an optional reason on the backend, but
 * `reason` is not a field of the agreement â€” it belongs to the transition and is stored on the
 * audit event â€” and a prompt can only name fields of the page's own schema. See the same note on
 * the order page.
 */
function buildAgreementActions() {
	return {
		/**
		 * Puts the agreement into force. Refused by the backend when it has no lines: a blanket
		 * order with nothing on it commits to nothing while looking as though it does.
		 */
		confirm: {
			label: 'actions.confirm',
			command: AgreementCommands.CONFIRM,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.AGREEMENT_STATUS_DRAFT,
			},
		},
		/**
		 * Drawing a new quotation is the point of a confirmed agreement, so it is offered only
		 * once the agreement is actually in force â€” a draft's prices are not agreed yet, and a
		 * closed one's have been withdrawn.
		 */
		create_rfq: {
			label: 'actions.create_rfq',
			command: AgreementCommands.CREATE_RFQ,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.AGREEMENT_STATUS_CONFIRMED,
			},
		},
		// Only a confirmed agreement can run its course. The backend refuses while orders raised
		// against it are still open, which would otherwise strand them.
		close: {
			label: 'actions.close',
			command: AgreementCommands.CLOSE,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.AGREEMENT_STATUS_CONFIRMED,
			},
		},
		// Offered from draft and confirmed alike; `in` rather than two conditions, since a closed
		// or already-cancelled agreement has nothing left to call off.
		cancel: {
			label: 'actions.cancel',
			command: AgreementCommands.CANCEL,
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.AGREEMENT_STATUS_DRAFT, c.AGREEMENT_STATUS_CONFIRMED],
			},
		},
	};
}

/**
 * The agreement's lines: what was committed to, at what price.
 *
 * `ordered_quantity` is deliberately absent from the field list â€” it is not a column. How much has
 * been drawn against a line is derived on read from the confirmed orders referencing it (Â§41).
 */
function buildAgreementLinesSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'purchase_agreement_sections_lines',
				translationNs: c.PURCHASE_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.AGREEMENT_LINE_SCHEMA_NAME,
				translationNs: c.PURCHASE_MODULE,
				searchCommand: AgreementLineCommands.SEARCH,
				filterGraph: { if: ['purchase_agreement_id', '=', '${id}'] },
				fields: ['sequence', 'product_variant_id', 'description', 'quantity', 'uom_id',
					'unit_price'],
			})],
		),
	];
}

/**
 * The orders drawn against this agreement.
 *
 * Unlike every other table in this module, its rows DO link away â€” to the order's own page, which
 * is a real destination. `linkRoutePath` is `purchase_orders` rather than the quotation route
 * because an order that already exists against an agreement is most often a committed one, and
 * both routes render the same detail pane anyway.
 */
function buildDrawnOrdersSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'purchase_agreement_sections_orders', translationNs: c.PURCHASE_MODULE },
			[resourceTableNode({
				schemaName: c.PURCHASE_ORDER_SCHEMA_NAME,
				translationNs: c.PURCHASE_MODULE,
				searchCommand: PurchaseOrderCommands.SEARCH,
				filterGraph: { if: ['agreement_id', '=', '${id}'] },
				fields: ['code', 'status', 'vendor_id', 'order_deadline', 'total_amount'],
				linkField: 'id',
				linkRoutePath: 'purchase_orders',
				fieldRenderers: {
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
				},
			})],
		),
	];
}
