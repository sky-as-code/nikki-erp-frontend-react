import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceListProps, resourceSplitViewProps,
	resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { OrderCommands } from '../features/order/commands';
import { TransactionCommands } from '../features/transaction/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildOrderPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildOrderListProps(),
		secondary: buildOrderDetailProps(),
	});

	return [definePage({
		routePath: 'orders',
		template: splitView.template,
		props: splitView.props,
	})];
}

/**
 * The order list.
 *
 * `createEnabled` is deliberately absent: an order is not typed in. It is minted by
 * `create_payment`, which records the order *and* asks a gateway to start collecting — a form that
 * wrote the row without the second half would produce an order no gateway knows about.
 *
 * Delete is likewise absent. An order is the record of an attempt to take money, including a
 * failed one, and removing it destroys the only evidence the attempt was made.
 */
function buildOrderListProps() {
	return resourceListProps({
		schemaName: c.ORDER_SCHEMA_NAME,
		translationNs: c.PAYMENTINVOICE_MODULE,
		linkField: 'id',
		searchCommand: OrderCommands.SEARCH,
		fieldRenderers: {
			// The colours track how far the money got: grey while nothing has happened, blue in
			// flight, green once collected, red when it was refused, and neutral once the order
			// is history. Refunded is deliberately not green — the money went back.
			status: {
				renderer: 'badge',
				colorMap: {
					pending: 'gray',
					processing: 'blue',
					payment_success: 'green',
					payment_failed: 'red',
					canceled: 'gray',
					refund_success: 'orange',
					refund_failed: 'red',
					expired: 'gray',
				},
				prefix: 'order_status.',
			},
			last_sync_status: {
				renderer: 'badge',
				colorMap: { success: 'green', failure: 'red' },
				prefix: 'sync_status.',
			},
		},
	});
}

function buildOrderDetailProps() {
	return resourceDetailProps({
		schemaName: c.ORDER_SCHEMA_NAME,
		translationNs: c.PAYMENTINVOICE_MODULE,
		titleLvl1: { schemaField: 'order_id' },
		titleLvl2: { schemaField: 'status' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: OrderCommands.GET_BY_ID,
			update: OrderCommands.UPDATE,
		},
		contextualActions: buildOrderActions(),
		formSections: [{
			header: 'form.generalInformation',
			// order_id is what the ordering system quotes; order_code is what the gateway knows
			// the order by. They are different strings and both are shown, because a support
			// conversation may start from either.
			fields: ['order_id', 'order_code', 'source', 'status', 'content', 'org_id'],
		}, {
			header: 'form.money',
			fields: ['amount', 'refund_amount', 'currency_id', 'payment_method_id'],
		}, {
			header: 'form.notification',
			// How the ordering system was told, and whether it heard. A failure here is what the
			// retry sweep looks for.
			fields: ['return_url', 'last_sync_status', 'sync_logs'],
		}, {
			header: 'form.gatewayData',
			// Whatever the paying method needed at order time, plus the gateway's own replies.
			fields: ['metadata'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
		childrenNodes: buildTransactionSection(),
	});
}

/**
 * Refund is the only action offered here, and it is guarded by the one status it makes sense in.
 *
 * `payment_success` is deliberately the only value: the backend's guard rails also permit a retry
 * after `refund_failed`, but offering the button on an order that was never paid — or on one
 * already fully refunded — invites the user to attempt something the backend will refuse. The
 * narrower condition is the honest one for a button.
 *
 * The prompt collects the amount because a partial refund is ordinary: the backend counts refunds
 * against a running total, so several partial ones may follow. `order_id` is prefilled from the
 * record rather than typed, because the refund is filed against the business identifier the
 * ordering system holds, not against this module's primary key.
 */
function buildOrderActions() {
	return {
		refund: {
			label: 'actions.refund',
			command: OrderCommands.REFUND,
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.ORDER_STATUS_PAYMENT_SUCCESS,
			},
			prompt: {
				title: 'actions.refund',
				fields: [
					{ name: 'order_id', required: true, defaultFromField: 'order_id' },
					{ name: 'amount', required: true },
					{ name: 'content' },
				],
			},
		},
	};
}

/**
 * The order's transactions, as a related-records table.
 *
 * One payment transaction is written with the order and one refund transaction is appended per
 * successful refund, so this is the audit trail of what actually moved. It is filtered by the
 * current route param and links nowhere: a transaction has no life outside the order that carries
 * it, and there is no transaction detail page to link to.
 */
function buildTransactionSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'form.transactions', translationNs: c.PAYMENTINVOICE_MODULE, expanded: true },
			[resourceTableNode({
				schemaName: c.TRANSACTION_SCHEMA_NAME,
				translationNs: c.PAYMENTINVOICE_MODULE,
				searchCommand: TransactionCommands.SEARCH,
				filterGraph: { if: ['order_id', '=', '${id}'] },
			})],
		),
	];
}
