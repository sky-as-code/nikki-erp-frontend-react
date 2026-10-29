import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/sales';
import { SalesReturnCommands } from '../../features/sales/salesReturn/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The refund request. A request is raised from an order (a cancelled paid order raises one on its
 * own) and lives here from draft to completion. Confirm is business approval: it records the
 * confirmer's note on the request, projects it onto the order, locks the amount against the order's
 * other pending requests and dispatches. Money moves only when the provider says so; the refund
 * status column is what reports that.
 */
export function buildSalesReturnPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesReturnListProps(),
		secondary: buildSalesReturnDetailProps(),
	});

	return [definePage({
		routePath: 'sales_return',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesReturnListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_RETURN_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesReturnCommands.SEARCH,
		// Raised from the order's own action, which is what ties a request to its lines.
		createEnabled: false,
		fieldRenderers: {
			status: {
				renderer: 'badge',
				colorMap: {
					draft: 'gray',
					approved: 'blue',
					processing: 'indigo',
					completed: 'green',
					cancelled: 'red',
				},
				prefix: 'status.',
			},
		},
	});
}

function buildSalesReturnDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_RETURN_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'return_number' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: SalesReturnCommands.GET_BY_ID,
		},
		contextualActions: buildSalesReturnActions(),
		childrenNodes: [buildSalesReturnFieldsSection()],
	});
}

/**
 * Confirm carries a prompt for the note because `confirmation_note` is a field of this resource,
 * which is the one kind a prompt can collect. Process stays offered on an approved request whose
 * dispatch did not complete; the backend refuses everything else with a reason.
 */
function buildSalesReturnActions() {
	return {
		confirm: {
			label: 'actions.confirm_refund',
			command: SalesReturnCommands.CONFIRM,
			actionCode: 'confirm_return',
			condition: { field: 'status', operator: 'equal' as const, value: c.RETURN_STATUS_DRAFT },
			prompt: {
				title: 'actions.confirm_refund.title',
				fields: [{ name: 'confirmation_note' }],
			},
		},
		process: {
			label: 'actions.process',
			command: SalesReturnCommands.PROCESS,
			actionCode: 'process_return',
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.RETURN_STATUS_APPROVED, c.RETURN_STATUS_PROCESSING],
			},
		},
		cancel: {
			label: 'actions.cancel',
			command: SalesReturnCommands.CANCEL,
			actionCode: 'update',
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.RETURN_STATUS_DRAFT, c.RETURN_STATUS_APPROVED],
			},
		},
	};
}

function buildSalesReturnFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.return',
			fields: ['return_number', 'sales_order_id', 'status', 'return_type', 'refund_reason',
				'refund_status', 'refund_total', 'locked_refund_amount', 'reason'],
		}),
		resourceFormColumnNode({
			header: 'form.notes',
			fields: ['confirmation_note', 'confirmed_at', 'requested_at', 'completed_at', 'cancelled_at'],
		}),
		resourceFormColumnNode({
			header: 'form.other_information',
			fields: ['inventory_return_status', 'fiscal_adjustment_status', 'inventory_reference',
				'failure_reason', 'org_id'],
		}),
	]);
}
