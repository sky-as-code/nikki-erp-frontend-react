import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceListProps, resourceSplitViewProps,
	resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { InvoiceCommands } from '../features/invoice/commands';
import { InvoiceLineCommands } from '../features/invoiceLine/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildInvoicePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildInvoiceListProps(),
		secondary: buildInvoiceDetailProps(),
	});

	return [definePage({
		routePath: 'invoices',
		template: splitView.template,
		props: splitView.props,
	})];
}

/**
 * The invoice list.
 *
 * Unlike an order, an invoice *is* authored — someone types the partner and the lines — so create
 * is enabled here. Delete is too, but only ever reaches a draft in practice: the backend refuses
 * nothing on delete, yet an issued invoice is an accounting document and removing one is a
 * decision the person doing it should be making deliberately rather than by habit.
 */
function buildInvoiceListProps() {
	return resourceListProps({
		schemaName: c.INVOICE_SCHEMA_NAME,
		translationNs: c.PAYMENTINVOICE_MODULE,
		linkField: 'id',
		searchCommand: InvoiceCommands.SEARCH,
		createEnabled: true,
		deleteCommand: InvoiceCommands.DELETE,
		updateSaveCommand: InvoiceCommands.UPDATE,
		fieldRenderers: {
			// Grey while it is only a draft, blue once it is a document, green when the money has
			// arrived, red once it has been struck out.
			status: {
				renderer: 'badge',
				colorMap: {
					draft: 'gray',
					issued: 'blue',
					paid: 'green',
					void: 'red',
				},
				prefix: 'invoice_status.',
			},
		},
	});
}

function buildInvoiceDetailProps() {
	return resourceDetailProps({
		schemaName: c.INVOICE_SCHEMA_NAME,
		translationNs: c.PAYMENTINVOICE_MODULE,
		// A draft has no number, so the partner is the heading that always says something. The
		// number appears in the form below once the invoice is issued.
		titleLvl1: { schemaField: 'partner_name' },
		titleLvl2: { schemaField: 'status' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: InvoiceCommands.GET_BY_ID,
			create: InvoiceCommands.CREATE,
			update: InvoiceCommands.UPDATE,
			delete: InvoiceCommands.DELETE,
		},
		contextualActions: buildInvoiceActions(),
		formSections: [{
			header: 'form.generalInformation',
			fields: ['number', 'status', 'issued_at', 'order_id', 'note', 'org_id'],
		}, {
			header: 'form.partner',
			fields: ['partner_name', 'partner_tax_code', 'partner_address'],
		}, {
			header: 'form.money',
			// All three are system-managed and recomputed from the lines on issue. They are shown
			// rather than hidden because they are the point of the document; the engine ignores
			// them on update, so showing them cannot let anyone write one.
			fields: ['currency_id', 'subtotal_amount', 'tax_amount', 'total_amount'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
		childrenNodes: buildLineSection(),
	});
}

/**
 * Issue is the only action, and it is offered on a draft alone.
 *
 * Issuing is irreversible: it mints a number from a per-year sequence and freezes the totals. The
 * backend refuses a second attempt, and the condition here means the button disappears rather than
 * inviting one.
 *
 * No prompt — everything an issued invoice says is computed from what is already recorded against
 * it, which is exactly what makes the totals agree with the lines.
 */
function buildInvoiceActions() {
	return {
		issue: {
			label: 'actions.issue',
			command: InvoiceCommands.ISSUE,
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
 * that carries it, and there is no line page to link to. It is expanded by default because the
 * lines *are* the invoice — the totals above are only their sum.
 */
function buildLineSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'form.invoiceLines', translationNs: c.PAYMENTINVOICE_MODULE, expanded: true },
			[resourceTableNode({
				schemaName: c.INVOICE_LINE_SCHEMA_NAME,
				translationNs: c.PAYMENTINVOICE_MODULE,
				searchCommand: InvoiceLineCommands.SEARCH,
				filterGraph: { if: ['invoice_id', '=', '${id}'] },
			})],
		),
	];
}
