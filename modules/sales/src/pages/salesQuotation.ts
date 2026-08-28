import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SalesQuotationCommands } from '../features/salesQuotation/commands';
import { SalesQuotationLineCommands } from '../features/salesQuotationLine/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


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
		routePath: 'sales_quotations',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesQuotationListProps() {
	return resourceListProps({
		schemaName: c.SALES_QUOTATION_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesQuotationCommands.SEARCH,
		createEnabled: true,
		fieldRenderers: {
			// `expired` is orange, not grey: a lapsed offer may still be reissued, where a
			// cancelled one was deliberately withdrawn.
			status: {
				renderer: 'badge',
				colorMap: {
					draft: 'gray',
					sent: 'blue',
					accepted: 'green',
					expired: 'orange',
					cancelled: 'red',
				},
				prefix: 'quotation_status.',
			},
		},
	});
}

function buildSalesQuotationDetailProps() {
	return resourceDetailProps({
		schemaName: c.SALES_QUOTATION_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
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
		childrenNodes: [buildSalesQuotationFieldsSection(), ...buildSalesQuotationLinesSection()],
	});
}

function buildSalesQuotationFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.quotation',
				fields: ['quotation_number', 'status', 'sales_channel_id', 'sales_point_id',
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
				fields: ['converted_sales_order_id', 'org_id', 'created_at', 'updated_at'],
			}),
		],
	);
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
function buildSalesQuotationLinesSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{
				header: 'sales_quotation_sections_lines',
				translationNs: c.SALES_MODULE,
				expanded: true,
			},
			[resourceTableNode({
				schemaName: c.SALES_QUOTATION_LINE_SCHEMA_NAME,
				translationNs: c.SALES_MODULE,
				searchCommand: SalesQuotationLineCommands.SEARCH,
				filterGraph: { if: ['sales_quotation_id', '=', '${id}'] },
				fields: ['line_number', 'product_name_snapshot', 'quantity', 'uom_id',
					'unit_price', 'discount_amount', 'net_amount', 'tax_amount', 'final_amount'],
			})],
		),
	];
}
