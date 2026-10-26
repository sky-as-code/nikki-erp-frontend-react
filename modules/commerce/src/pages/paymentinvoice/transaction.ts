// Proxy copy of `nikkierp/modules/paymentinvoice/src/pages/transaction.ts`; keep in step. Commerce registers nothing for these schemas:
// the paymentinvoice micro-app stays in the host and is lazy-loaded to serve them.
import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import { resourceListV2Props } from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/paymentinvoice';
import { TransactionCommands } from '../../features/paymentinvoice/commands';


/**
 * The transactions list: every movement of money across every order, read-only.
 *
 * A flat list rather than a split view, and no create, update or delete. Transactions are written
 * by the payment flow — one with the order, one per successful refund — and each carries the
 * gateway's own record of what happened. Editing one would make the module's account of a payment
 * disagree with the gateway's, which is precisely what this table exists to let someone check.
 *
 * The order detail page shows the same records filtered to one order; this page is the way in when
 * the question starts from a gateway reference rather than from an order.
 */
export function buildTransactionPages(): PageNode[] {
	const list = resourceListV2Props({
		schemaName: c.TRANSACTION_SCHEMA_NAME,
		translationNs: c.PAYMENTINVOICE_MODULE,
		searchCommand: TransactionCommands.SEARCH,
		fieldRenderers: {
			status: {
				renderer: 'badge',
				colorMap: {
					pending: 'gray',
					completed: 'green',
					failed: 'red',
					canceled: 'gray',
				},
				prefix: 'transaction_status.',
			},
			// Money in and money out read very differently at a glance, which is the whole point
			// of showing both in one list.
			transaction_type: {
				renderer: 'badge',
				colorMap: { payment: 'blue', refund: 'orange' },
				prefix: 'transaction_type.',
			},
		},
	});

	return [definePage({
		routePath: 'transactions',
		template: list.template,
		props: list.props,
	})];
}
