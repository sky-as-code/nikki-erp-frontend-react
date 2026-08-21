import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	FilterGraph, collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode,
	resourceListProps, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { StockQuantCommands } from '../features/stockQuant/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * Stock balance is a read-only view.
 *
 * A balance is the running total of the movements that completed against it, not a document a
 * user edits: the backend engine refuses create, update and delete on this resource. The page
 * therefore binds no write action at all, so the UI never offers a button the server would reject.
 * Corrections happen through an inventory adjustment, transfer or scrap. See BR Â§3.3, Â§4.2.2.6
 * and AC-STOCK-002.
 */
export function buildStockQuantPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockQuantListProps(),
		secondary: buildStockQuantDetailProps(),
	});
	// Same list and detail, filtered to the cycle-count worklist (BR Â§4.2.8, AC-STOCK-016): a
	// second entry point into the balance page rather than a page of its own, reached from the
	// "Äáº¿n háº¡n kiá»ƒm kÃª" menu item so it is distinguishable from the unfiltered Stock Balance link.
	const countsDueView = resourceSplitViewProps({
		primary: buildStockQuantListProps({
			filterGraph: { if: ['next_count_date', '<=', '${today}'] },
		}),
		secondary: buildStockQuantDetailProps(),
	});

	return [definePage({
		routePath: 'stock_balance',
		template: splitView.template,
		props: splitView.props,
	}), definePage({
		routePath: 'stock_balance_counts_due',
		template: countsDueView.template,
		props: countsDueView.props,
	})];
}

function buildStockQuantListProps(overrides?: { filterGraph?: FilterGraph }) {
	return resourceListProps({
		schemaName: c.STOCK_QUANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockQuantCommands.SEARCH,
		// No createEnabled, deleteCommand or archiveCommand: every write is refused server-side,
		// and the resource has no is_archived column to archive against.
		createEnabled: false,
		...overrides,
	});
}

function buildStockQuantDetailProps() {
	return resourceDetailProps({
		schemaName: c.STOCK_QUANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'product_variant_id' },
		titleLvl2: { schemaField: 'location_id' },
		backLinkTitle: { linkHref: '../' },
		// getById only. Naming an update or delete command here would render actions the engine
		// answers with a business violation.
		standardActionCommands: {
			getById: StockQuantCommands.GET_BY_ID,
		},
		contextualActions: buildCountingActions(),
		childrenNodes: [buildStockQuantFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildStockQuantFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['product_variant_id', 'location_id', 'base_uom_id', 'org_id'],
			}),
			resourceFormColumnNode({
				// available_quantity is derived on the server; it has no column and is never sent back.
				header: 'form.quantities',
				fields: ['on_hand_quantity', 'reserved_quantity', 'available_quantity', 'incoming_date'],
			}),
			resourceFormColumnNode({
				// Empty until a lot, package or owner actually narrows the balance â€” a read-mode field
				// with no value is hidden, so an untracked balance simply does not show this block.
				header: 'form.identification',
				fields: ['lot_ref', 'package_ref', 'owner_ref'],
			}),
			resourceFormColumnNode({
				header: 'form.counting',
				fields: [
					'counted_quantity', 'count_quantity_set', 'count_snapshot_quantity',
					'count_reason_code', 'count_reason_text',
					'next_count_date', 'last_count_date', 'count_assigned_user_id',
				],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * The counting operations (BR Â§4.2.7, Â§4.2.8).
 *
 * These write to a resource whose create, update and delete are all refused, which looks
 * contradictory and is not: the refusal exists to stop a client setting a balance with no movement
 * behind it, and none of these touches on_hand_quantity. Enter and reset write count metadata;
 * apply changes the balance only by generating an adjustment movement.
 *
 * Enter Count is the one that carries a `prompt`. A counted quantity is a number the user types,
 * so the payload-free action bar could never drive it â€” which is the whole reason the prompt
 * exists. The other four need nothing beyond the record they act on.
 */
function buildCountingActions() {
	return {
		enter_count: {
			label: 'actions.enter_count',
			command: StockQuantCommands.ENTER_COUNT,
			prompt: {
				title: 'actions.enter_count.title',
				fields: [
					// Prefilled from the current balance so the counter edits a figure rather than
					// typing one from scratch â€” and so a confirmed-correct shelf is one click.
					{ name: 'counted_quantity', required: true, defaultFromField: 'on_hand_quantity' },
					{ name: 'count_reason_code' },
					{ name: 'count_reason_text' },
				],
			},
		},
		// Both of these are meaningful only while a count is pending, and `count_quantity_set` is
		// the authority on that â€” never `counted_quantity`, since a count of zero is a legitimate
		// result ("the shelf is empty") and testing the value would hide the action for exactly
		// the case a counter most needs recorded.
		apply_adjustment: {
			label: 'actions.apply_adjustment',
			command: StockQuantCommands.APPLY_ADJUSTMENT,
			condition: { field: 'count_quantity_set', operator: 'equal' as const, value: true },
		},
		reset_count: {
			label: 'actions.reset_count',
			command: StockQuantCommands.RESET_COUNT,
			condition: { field: 'count_quantity_set', operator: 'equal' as const, value: true },
		},
	};
}
