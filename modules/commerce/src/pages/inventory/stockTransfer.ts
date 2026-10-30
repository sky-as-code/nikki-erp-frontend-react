import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { StockTransferCommands } from '../../features/inventory/stockTransfer/commands';
import { stockTransferMovesNode } from '../../viewkit/inventory/props';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** One colour map for the list badge and the detail status strip, so both read alike. */
const STATUS_BADGE = {
	renderer: 'badge',
	colorMap: {
		draft: 'gray',
		waiting: 'yellow',
		confirmed: 'blue',
		ready: 'green',
		done: 'teal',
		cancelled: 'red',
	},
	prefix: 'transfer_status.',
} as const;

export function buildStockTransferPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockTransferListProps(),
		secondary: buildStockTransferDetailProps(),
	});

	return [definePage({
		routePath: 'inventory_stock_transfer',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockTransferListProps() {
	return resourceListV2Props({
		schemaName: c.STOCK_TRANSFER_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockTransferCommands.SEARCH,
		createEnabled: true,
		deleteCommand: StockTransferCommands.DELETE,
		updateSaveCommand: StockTransferCommands.UPDATE,
		fieldRenderers: {
			// The colours track how far a transfer has got and whether it can still be acted on:
			// grey while it is only a plan, blue once it is committed, green when the stock is
			// accounted for, and neutral once it is history.
			status: STATUS_BADGE,
			operation_code: {
				renderer: 'badge',
				colorMap: { incoming: 'green', outgoing: 'orange', internal: 'blue' },
				prefix: 'operation_code.',
			},
		},
	});
}

function buildStockTransferDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.STOCK_TRANSFER_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		...statusStripProps(STATUS_BADGE),
		titleLvl1: { schemaField: 'transfer_number' },
		// The operation (Receipt, Delivery, ...) says what the transfer is; the status strip says how far it got.
		titleLvl2: { schemaField: 'operation_type_id' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: StockTransferCommands.GET_BY_ID,
			create: StockTransferCommands.CREATE,
			update: StockTransferCommands.UPDATE,
			delete: StockTransferCommands.DELETE,
		},
		contextualActions: buildMovementActions(),
		createNodes: buildStockTransferSections('create'),
		childrenNodes: buildStockTransferSections('detail'),
	});
}

/**
 * Shared by both form modes: the transfer's own fields, its policies, then its moves. The policies are
 * snapshots a reader of an existing transfer rarely needs, so its detail page opens them collapsed.
 */
function buildStockTransferSections(page: 'create' | 'detail'): ComponentNode[] {
	return [
		buildStockTransferFieldsSection(),
		buildStockTransferPoliciesSection(page === 'create'),
		buildStockTransferMovesSection(),
	];
}

function buildStockTransferFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: [
				'transfer_number', 'operation_code', 'operation_type_id', 'status', 'origin_reference', 'note',
			],
			// The code picks the operation: on create the backend resolves the org's operation type
			// for it when none is chosen, so the select only offers the types of the chosen code.
			readOnlyFields: ['operation_code'],
			relationSearch: {
				operation_type_id: { matchFormFields: { operation_code: 'operation_code' } },
			},
		}),
		resourceFormColumnNode({
			header: 'form.movement',
			fields: ['source_location_id', 'destination_location_id', 'priority'],
		}),
		resourceFormColumnNode({
			header: 'form.scheduling',
			fields: ['scheduled_at', 'deadline_at', 'completed_at'],
		}),
	]);
}

function buildStockTransferPoliciesSection(expanded: boolean): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.policies',
		expanded,
	}, [
		resourceFormColumnNode({
			header: 'form.stockPolicies',
			// Snapshots taken at create time, shown so a reader can see what this transfer will do
			// rather than what its operation type currently says (BR §4.2.3.4).
			fields: ['reservation_method', 'backorder_policy', 'shipping_policy'],
		}),
		resourceFormColumnNode({
			header: 'form.backorder',
			fields: ['backorder_of_id', 'return_of_id', 'chain_group_id'],
		}),
	]);
}

/**
 * The moves, edited inline and saved with the transfer in one request while it is a draft. A
 * section of the form, not a related-resources tab: those are read-only and update-mode only. Move
 * lines are not shown: the reservation engine writes them.
 */
function buildStockTransferMovesSection(): ComponentNode {
	return collapsibleSectionNode({
		translationNs: c.INVENTORY_MODULE,
		header: 'form.moves',
	}, [stockTransferMovesNode()]);
}

/**
 * The movement operations, each guarded by the state it makes sense in.
 *
 * The conditions are what keep the action bar honest: Validate on a draft transfer would be
 * refused by the backend anyway, but offering it invites the user to try. Cancel disappears once
 * the transfer is done, because a completed movement is corrected by a reverse transfer rather
 * than by cancelling it (AC-STOCK-009).
 *
 * `condition` compares a single field, so each action gets the one state that most warrants it
 * rather than the full set it would technically accept.
 */
function buildMovementActions() {
	return {
		confirm: {
			label: 'actions.confirm',
			command: StockTransferCommands.CONFIRM,
			actionCode: 'confirm',
			condition: { field: 'status', operator: 'equal' as const, value: 'draft' },
		},
		check_availability: {
			label: 'actions.check_availability',
			command: StockTransferCommands.CHECK_AVAILABILITY,
			actionCode: 'read',
			condition: { field: 'status', operator: 'not_in' as const, value: ['draft', 'done', 'cancelled'] },
		},
		reserve: {
			label: 'actions.reserve',
			command: StockTransferCommands.RESERVE,
			actionCode: 'reserve',
			condition: { field: 'status', operator: 'not_in' as const, value: ['draft', 'done', 'cancelled'] },
		},
		unreserve: {
			label: 'actions.unreserve',
			command: StockTransferCommands.UNRESERVE,
			actionCode: 'unreserve',
			condition: { field: 'status', operator: 'in' as const, value: ['confirmed', 'ready'] },
		},
		validate: {
			label: 'actions.validate',
			command: StockTransferCommands.VALIDATE,
			actionCode: 'validate',
			condition: { field: 'status', operator: 'in' as const, value: ['confirmed', 'ready'] },
		},
		cancel: {
			label: 'actions.cancel',
			command: StockTransferCommands.CANCEL,
			actionCode: 'cancel',
			condition: { field: 'status', operator: 'not_in' as const, value: ['done', 'cancelled'] },
		},
		// The one action that appears only once a transfer is done, and the counterpart to
		// cancel's disappearing there: a completed movement is corrected by reversing it
		// (AC-STOCK-009, AC-STOCK-021). No prompt â€” it defaults to the full returnable quantity
		// per move and lands as a draft the user can trim before confirming.
		create_return: {
			label: 'actions.create_return',
			command: StockTransferCommands.CREATE_RETURN,
			actionCode: 'create_return',
			condition: { field: 'status', operator: 'equal' as const, value: 'done' },
		},
	};
}
