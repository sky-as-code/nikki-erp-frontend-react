import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/sales';
import { SalesQuotationCommands } from '../../features/sales/salesQuotation/commands';
import { SalesQuotationLineCommands } from '../../features/sales/salesQuotationLine/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** One colour map for the list badge and the detail status strip, so both read alike. */
const STATUS_BADGE = {
	renderer: 'badge',
	colorMap: {
		draft: 'gray',
		sent: 'blue',
		accepted: 'green',
		expired: 'orange',
		cancelled: 'red',
	},
	prefix: 'quotation_status.',
} as const;

/**
 * A quotation is not a draft order: it has its own numbering, because one that never converts would
 * leave a hole in the order sequence that fiscal systems read.
 */
export function buildSalesQuotationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesQuotationListProps(),
		secondary: buildSalesQuotationDetailProps(),
	});

	return [definePage({
		routePath: 'sales_quotation',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesQuotationListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_QUOTATION_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesQuotationCommands.SEARCH,
		createEnabled: true,
		fieldRenderers: {
			// `expired` is orange, not grey: a lapsed offer may still be reissued, where a
			// cancelled one was deliberately withdrawn.
			status: STATUS_BADGE,
		},
	});
}

function buildSalesQuotationDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_QUOTATION_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		...statusStripProps({
			statuses: Object.keys(STATUS_BADGE.colorMap),
			prefix: STATUS_BADGE.prefix,
			alternativeEnds: ['expired', 'cancelled'],
		}),
		titleLvl1: { schemaField: 'quotation_number' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesQuotationCommands.GET_BY_ID,
			create: SalesQuotationCommands.CREATE,
			update: SalesQuotationCommands.UPDATE,
		},
		contextualActions: buildSalesQuotationActions(),
		createNodes: [buildSalesQuotationFieldsSection()],
		childrenNodes: [buildSalesQuotationFieldsSection()],
		relatedResources: buildSalesQuotationLinesResources(),
	});
}

function buildSalesQuotationFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.quotation',
			fields: ['quotation_number', 'sales_channel_id', 'sales_point_id',
				'customer_reference', 'currency_code'],
		}),
		resourceFormColumnNode({
			header: 'form.validity',
			// An empty `valid_until` never lapses, and that absence is deliberate.
			fields: ['valid_until', 'sent_at', 'accepted_at', 'cancelled_at'],
		}),
		resourceFormColumnNode({
			header: 'form.totals',
			fields: ['subtotal', 'discount_total', 'tax_total', 'grand_total'],
		}),
		resourceFormColumnNode({
			header: 'form.other_information',
			fields: ['converted_sales_order_id'],
		}),
	]);
}

/**
 * A prompt narrows the page's own resource schema to the named fields and silently drops any name
 * the schema does not declare, so it can only collect real fields of the resource. `convert` can
 * prompt because `sales_point_id` is one.
 */
function buildSalesQuotationActions() {
	return {
		send: {
			label: 'actions.send',
			command: SalesQuotationCommands.SEND,
			actionCode: 'update',
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.QUOTATION_STATUS_DRAFT,
			},
		},
		/**
		 * Conversion re-prices rather than copying the quoted numbers, so a stale quotation becomes
		 * an order at today's prices; honouring the old price is a manual discount. Not offered on a
		 * draft, which would create a sale the customer never saw.
		 */
		convert: {
			label: 'actions.convert',
			command: SalesQuotationCommands.CONVERT,
			actionCode: 'convert',
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.QUOTATION_STATUS_SENT, c.QUOTATION_STATUS_ACCEPTED],
			},
			prompt: {
				title: 'actions.convert',
				fields: [{ name: 'sales_point_id', required: true }],
			},
		},
		/** Includes `expired`: formally closing a lapsed offer is ordinary. */
		cancel: {
			label: 'actions.cancel',
			command: SalesQuotationCommands.CANCEL,
			actionCode: 'update',
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.QUOTATION_STATUS_DRAFT, c.QUOTATION_STATUS_SENT,
					c.QUOTATION_STATUS_EXPIRED],
			},
		},
	};
}

/**
 * Conversion carries the lines across, not the money: the order rebuilds its own totals from the
 * pricing engine so it can explain them.
 */
function buildSalesQuotationLinesResources() {
	return [
		{
			label: 'sales_quotation_sections_lines',
			schemaName: c.SALES_QUOTATION_LINE_SCHEMA_NAME,
			translationNs: c.SALES_MODULE,
			searchCommand: SalesQuotationLineCommands.SEARCH,
			initialGraph: { if: ['sales_quotation_id', '=', '${id}'] },
			fields: ['line_number', 'product_name_snapshot', 'quantity', 'uom_id',
				'unit_price', 'discount_amount', 'net_amount', 'tax_amount', 'final_amount'],
		},
	];
}
