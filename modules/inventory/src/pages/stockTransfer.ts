import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { StockMoveCommands } from '../features/stockMove/commands';
import { StockMoveLineCommands } from '../features/stockMoveLine/commands';
import { StockTransferCommands } from '../features/stockTransfer/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildStockTransferPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockTransferListProps(),
		secondary: buildStockTransferDetailProps(),
	});

	return [definePage({
		routePath: 'stock_transfers',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockTransferListProps() {
	return resourceListProps({
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
			status: {
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
			},
			operation_code: {
				renderer: 'badge',
				colorMap: { incoming: 'green', outgoing: 'orange', internal: 'blue' },
				prefix: 'operation_code.',
			},
		},
	});
}

function buildStockTransferDetailProps() {
	return resourceDetailProps({
		schemaName: c.STOCK_TRANSFER_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'transfer_number' },
		titleLvl2: { schemaField: 'status' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: StockTransferCommands.GET_BY_ID,
			create: StockTransferCommands.CREATE,
			update: StockTransferCommands.UPDATE,
			delete: StockTransferCommands.DELETE,
		},
		contextualActions: buildMovementActions(),
		createNodes: [buildStockTransferFieldsSection()],
		childrenNodes: [buildStockTransferFieldsSection(), ...buildMovementSections()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildStockTransferFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: [
					'transfer_number', 'operation_type_id', 'operation_code', 'status',
					'origin_reference', 'note', 'org_id',
				],
			}),
			resourceFormColumnNode({
				header: 'form.movement',
				fields: ['source_location_id', 'destination_location_id', 'priority'],
			}),
			resourceFormColumnNode({
				header: 'form.stockPolicies',
				// Snapshots taken at create time, shown so a reader can see what this transfer will do
				// rather than what its operation type currently says (BR Â§4.2.3.4).
				fields: ['reservation_method', 'backorder_policy', 'shipping_policy'],
			}),
			resourceFormColumnNode({
				header: 'form.scheduling',
				fields: ['scheduled_at', 'deadline_at', 'completed_at'],
			}),
			resourceFormColumnNode({
				header: 'form.backorder',
				fields: ['backorder_of_id', 'return_of_id', 'chain_group_id'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['created_at', 'updated_at'],
			}),
		],
	);
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
			condition: { field: 'status', operator: 'equal' as const, value: 'draft' },
		},
		check_availability: {
			label: 'actions.check_availability',
			command: StockTransferCommands.CHECK_AVAILABILITY,
			condition: { field: 'status', operator: 'not_in' as const, value: ['draft', 'done', 'cancelled'] },
		},
		reserve: {
			label: 'actions.reserve',
			command: StockTransferCommands.RESERVE,
			condition: { field: 'status', operator: 'not_in' as const, value: ['draft', 'done', 'cancelled'] },
		},
		unreserve: {
			label: 'actions.unreserve',
			command: StockTransferCommands.UNRESERVE,
			condition: { field: 'status', operator: 'in' as const, value: ['confirmed', 'ready'] },
		},
		validate: {
			label: 'actions.validate',
			command: StockTransferCommands.VALIDATE,
			condition: { field: 'status', operator: 'in' as const, value: ['confirmed', 'ready'] },
		},
		cancel: {
			label: 'actions.cancel',
			command: StockTransferCommands.CANCEL,
			condition: { field: 'status', operator: 'not_in' as const, value: ['done', 'cancelled'] },
		},
		// The one action that appears only once a transfer is done, and the counterpart to
		// cancel's disappearing there: a completed movement is corrected by reversing it
		// (AC-STOCK-009, AC-STOCK-021). No prompt â€” it defaults to the full returnable quantity
		// per move and lands as a draft the user can trim before confirming.
		create_return: {
			label: 'actions.create_return',
			command: StockTransferCommands.CREATE_RETURN,
			condition: { field: 'status', operator: 'equal' as const, value: 'done' },
		},
	};
}

/**
 * The transfer's moves and their execution lines, as related-records tables.
 *
 * Both are filtered by the current route param, the same pattern as the product template's
 * variants table. Move lines are read-only: they are written by the reservation engine, and
 * letting a user edit an allocation would need the release-and-re-reserve flow of BR Â§4.2.5.4.
 *
 * Neither links to a Moves page, because there is none: a move has no life outside the transfer
 * that carries it. They link to the *product* instead, which is the question a reader of a
 * transfer line actually has â€” "what is this thing?" â€” and completes the navigation in the
 * direction Stock â†’ Product (CR Â§17).
 */
function buildMovementSections(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'form.moves', translationNs: c.INVENTORY_MODULE, expanded: true },
			[resourceTableNode({
				schemaName: c.STOCK_MOVE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: StockMoveCommands.SEARCH,
				filterGraph: { if: ['transfer_id', '=', '${id}'] },
				linkField: 'product_variant_id',
				linkRoutePath: 'product_variants',
			})],
		),
		collapsibleSectionNode(
			{ header: 'form.moveLines', translationNs: c.INVENTORY_MODULE, expanded: false },
			[resourceTableNode({
				schemaName: c.STOCK_MOVE_LINE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: StockMoveLineCommands.SEARCH,
				filterGraph: { if: ['transfer_id', '=', '${id}'] },
				linkField: 'product_variant_id',
				linkRoutePath: 'product_variants',
			})],
		),
	];
}
