import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { InvoiceCommands } from '../features/invoice/commands';
import { InvoiceLineCommands } from '../features/invoiceLine/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** One colour map for the list badge and the detail status strip, so both read alike. */
const STATUS_BADGE = {
	renderer: 'badge',
	colorMap: {
		draft: 'gray',
		issued: 'blue',
		paid: 'green',
		void: 'red',
	},
	prefix: 'invoice_status.',
} as const;

export function buildInvoicePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildInvoiceListProps(),
		secondary: buildInvoiceDetailProps(),
	});

	return [definePage({
		routePath: 'paymentinvoice_invoice',
		template: splitView.template,
		props: splitView.props,
	})];
}

/**
 * The invoice list.
 *
 * Unlike an order, an invoice *is* authored â€” someone types the partner and the lines â€” so create
 * is enabled here. Delete is too, but only ever reaches a draft in practice: the backend refuses
 * nothing on delete, yet an issued invoice is an accounting document and removing one is a
 * decision the person doing it should be making deliberately rather than by habit.
 */
function buildInvoiceListProps() {
	return resourceListV2Props({
		schemaName: c.INVOICE_SCHEMA_NAME,
		translationNs: c.PAYMENTINVOICE_MODULE,
		linkField: 'id',
		searchCommand: InvoiceCommands.SEARCH,
		createEnabled: true,
		deleteCommand: InvoiceCommands.DELETE,
		updateSaveCommand: InvoiceCommands.UPDATE,
		updateCommand: InvoiceCommands.UPDATE,
		fieldRenderers: {
			// Grey while it is only a draft, blue once it is a document, green when the money has
			// arrived, red once it has been struck out.
			status: STATUS_BADGE,
		},
	});
}

function buildInvoiceDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.INVOICE_SCHEMA_NAME,
		translationNs: c.PAYMENTINVOICE_MODULE,
		...statusStripProps(STATUS_BADGE),
		// A draft has no number, so the partner is the heading that always says something. The
		// number appears in the form below once the invoice is issued.
		titleLvl1: { schemaField: 'partner_name' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: InvoiceCommands.GET_BY_ID,
			create: InvoiceCommands.CREATE,
			update: InvoiceCommands.UPDATE,
			delete: InvoiceCommands.DELETE,
		},
		contextualActions: buildInvoiceActions(),
		createNodes: [buildInvoiceFieldsSection()],
		childrenNodes: [buildInvoiceFieldsSection()],
		relatedResources: buildLineResources(),
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildInvoiceFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.PAYMENTINVOICE_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['number', 'status', 'issued_at', 'order_id', 'note'],
		}),
		resourceFormColumnNode({
			header: 'form.partner',
			fields: ['partner_name', 'partner_tax_code', 'partner_address'],
		}),
		resourceFormColumnNode({
			header: 'form.money',
			// All three are system-managed and recomputed from the lines on issue. They are shown
			// rather than hidden because they are the point of the document; the engine ignores
			// them on update, so showing them cannot let anyone write one.
			fields: ['currency_id', 'subtotal_amount', 'tax_amount', 'total_amount'],
		}),
	]);
}

/**
 * Issue is the only action, and it is offered on a draft alone.
 *
 * Issuing is irreversible: it mints a number from a per-year sequence and freezes the totals. The
 * backend refuses a second attempt, and the condition here means the button disappears rather than
 * inviting one.
 *
 * No prompt â€” everything an issued invoice says is computed from what is already recorded against
 * it, which is exactly what makes the totals agree with the lines.
 */
function buildInvoiceActions() {
	return {
		issue: {
			label: 'actions.issue',
			command: InvoiceCommands.ISSUE,
			actionCode: 'issue',
			condition: {
				field: 'status',
				operator: 'equal' as const,
				value: c.INVOICE_STATUS_DRAFT,
			},
		},
	};
}

/**
 * The invoice's lines, as a related-records table.
 *
 * Filtered by the current route param and linking nowhere: a line has no life outside the invoice
 * that carries it, and there is no line page to link to.
 */
function buildLineResources() {
	return [
		{
			label: 'form.invoiceLines',
			schemaName: c.INVOICE_LINE_SCHEMA_NAME,
			translationNs: c.PAYMENTINVOICE_MODULE,
			searchCommand: InvoiceLineCommands.SEARCH,
			initialGraph: { if: ['invoice_id', '=', '${id}'] },
		},
	];
}
