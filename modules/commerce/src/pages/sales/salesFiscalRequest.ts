import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/sales';
import { SalesFiscalRequestCommands } from '../../features/sales/salesFiscalRequest/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** One colour map for the list badge and the detail status strip, so both read alike. */
const STATUS_BADGE = {
	renderer: 'badge',
	colorMap: {
		pending: 'orange',
		issued: 'green',
		failed: 'red',
		cancelled: 'gray',
	},
	prefix: 'fiscal_status.',
} as const;

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
		routePath: 'sales_fiscal_request',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesFiscalRequestListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_FISCAL_REQUEST_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesFiscalRequestCommands.SEARCH,
		createEnabled: false,
		fieldRenderers: {
			status: STATUS_BADGE,
		},
	});
}

function buildSalesFiscalRequestDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_FISCAL_REQUEST_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		...statusStripProps({
			statuses: Object.keys(STATUS_BADGE.colorMap),
			prefix: STATUS_BADGE.prefix,
			alternativeEnds: ['failed', 'cancelled'],
		}),
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
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.request',
			fields: ['sales_bill_id', 'intent', 'requested_at', 'issued_at'],
		}),
		resourceFormColumnNode({
			header: 'form.provider',
			// `provider_reference` is the only durable link to the issued document.
			// `idempotency_key` travels to the provider rather than merely constraining the
			// table: a retry must send the same one or it issues a second invoice.
			fields: ['provider_reference', 'idempotency_key', 'attempt_count', 'last_error'],
		}),
		resourceFormColumnNode({
			header: 'form.other_information',
			fields: ['original_fiscal_request_id', 'buyer_snapshot'],
		}),
	]);
}
