import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import { resourceDetailProps, resourceListProps, resourceSplitViewProps } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { StockQuantCommands } from '../features/stockQuant/commands';


/**
 * Stock balance is a read-only view.
 *
 * A balance is the running total of the movements that completed against it, not a document a
 * user edits: the backend engine refuses create, update and delete on this resource. The page
 * therefore binds no write action at all, so the UI never offers a button the server would reject.
 * Corrections happen through an inventory adjustment, transfer or scrap. See BR §3.3, §4.2.2.6
 * and AC-STOCK-002.
 */
export function buildStockQuantPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockQuantListProps(),
		secondary: buildStockQuantDetailProps(),
	});

	return [definePage({
		routePath: 'stock_balance',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockQuantListProps() {
	return resourceListProps({
		schemaName: c.STOCK_QUANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockQuantCommands.SEARCH,
		// No createEnabled, deleteCommand or archiveCommand: every write is refused server-side,
		// and the resource has no is_archived column to archive against.
		createEnabled: false,
	});
}

function buildStockQuantDetailProps() {
	return resourceDetailProps({
		schemaName: c.STOCK_QUANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'product_variant_id' },
		titleLvl2: { schemaField: 'location_id' },
		titleLvl3: { linkHref: '../' },
		// getById only. Naming an update or delete command here would render actions the engine
		// answers with a business violation.
		standardActionCommands: {
			getById: StockQuantCommands.GET_BY_ID,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['product_variant_id', 'location_id', 'base_uom_id', 'org_id'],
		}, {
			// available_quantity is derived on the server; it has no column and is never sent back.
			header: 'form.quantities',
			fields: ['on_hand_quantity', 'reserved_quantity', 'available_quantity', 'incoming_date'],
		}, {
			// Empty until a lot, package or owner actually narrows the balance — a read-mode field
			// with no value is hidden, so an untracked balance simply does not show this block.
			header: 'form.identification',
			fields: ['lot_ref', 'package_ref', 'owner_ref'],
		}, {
			header: 'form.counting',
			fields: [
				'counted_quantity', 'count_quantity_set', 'count_snapshot_quantity',
				'count_reason_code', 'count_reason_text',
				'next_count_date', 'last_count_date', 'count_assigned_user_id',
			],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
	});
}
