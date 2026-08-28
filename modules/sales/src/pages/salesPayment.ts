import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesPaymentCommands } from '../features/salesPayment/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Read-only: a payment is recorded through a bill's `pay` action, which applies gates a plain create
 * would bypass — among them that the method is mapped to the channel and usable in the running
 * build. Only a `captured` payment counts toward settlement; an `authorized` one is a hold the
 * provider may still release.
 */
export function buildSalesPaymentPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesPaymentListProps(),
		secondary: buildSalesPaymentDetailProps(),
	});

	return [definePage({
		routePath: 'sales_payments',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesPaymentListProps() {
	return resourceListProps({
		schemaName: c.SALES_PAYMENT_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesPaymentCommands.SEARCH,
		createEnabled: false,
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
	});
}

function buildSalesPaymentDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_PAYMENT_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'payment_method_code_snapshot' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesPaymentCommands.GET_BY_ID,
		},
		childrenNodes: [buildSalesPaymentFieldsSection()],
	});
}

/** All of these are written by the bill's `pay` action. */
function buildSalesPaymentFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.payment',
				fields: ['sales_bill_id', 'payment_method_id', 'payment_method_code_snapshot',
					'amount', 'currency_code', 'status'],
			}),
			resourceFormColumnNode({
				header: 'form.other_information',
				// Cash carries no external transaction id, so it has no replay protection and a
				// double-tap records twice. That is a property of cash, not a gap here.
				fields: ['external_transaction_id', 'provider_reference', 'paid_at', 'org_id',
					'created_at', 'updated_at'],
			}),
		],
	);
}
