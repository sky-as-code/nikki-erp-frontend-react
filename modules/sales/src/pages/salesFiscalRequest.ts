import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceFormColumnNode, resourceListProps, resourceSplitViewProps, tabCollapsibleSectionNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesFiscalRequestCommands } from '../features/salesFiscalRequest/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The row is written before the provider is called: a timeout after the provider issued the invoice
 * would otherwise leave Sales with no row and no key, and the next attempt would issue a second
 * invoice against the same sale. No eInvoice provider adapter ships here, so a request that stays
 * `pending` is the expected state, not a failure.
 */
export function buildSalesFiscalRequestPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesFiscalRequestListProps(),
		secondary: buildSalesFiscalRequestDetailProps(),
	});

	return [definePage({
		routePath: 'sales_fiscal_requests',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesFiscalRequestListProps() {
	return resourceListProps({
		schemaName: c.SALES_FISCAL_REQUEST_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesFiscalRequestCommands.SEARCH,
		createEnabled: false,
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
	});
}

function buildSalesFiscalRequestDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_FISCAL_REQUEST_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'provider_reference' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesFiscalRequestCommands.GET_BY_ID,
		},
		childrenNodes: [buildSalesFiscalRequestFieldsSection()],
	});
}

/** No update or delete: a fiscal document that could be edited afterwards would not be one. */
function buildSalesFiscalRequestFieldsSection(): ComponentNode {
	return tabCollapsibleSectionNode({
		translationNs: c.SALES_MODULE,
		tabs: [
			{
				key: 'request',
				header: 'form.request',
				content: resourceFormColumnNode({
					header: 'form.request',
					fields: ['sales_bill_id', 'intent', 'status', 'requested_at', 'issued_at'],
				}),
			},
			{
				key: 'provider',
				header: 'form.provider',
				content: resourceFormColumnNode({
					header: 'form.provider',
					// `provider_reference` is the only durable link to the issued document.
					// `idempotency_key` travels to the provider rather than merely constraining the
					// table: a retry must send the same one or it issues a second invoice.
					fields: ['provider_reference', 'idempotency_key', 'attempt_count', 'last_error'],
				}),
			},
			{
				key: 'other',
				header: 'form.other_information',
				content: resourceFormColumnNode({
					header: 'form.other_information',
					fields: ['original_fiscal_request_id', 'buyer_snapshot', 'org_id', 'created_at'],
				}),
			},
		],
	});
}
