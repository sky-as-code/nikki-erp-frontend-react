import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { StockMoveLineCommands } from '../../features/inventory/stockMoveLine/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const FLOAT_RENDERER = { renderer: 'float' };
const MOVE_LINE_RENDERERS = { quantity: FLOAT_RENDERER, base_quantity: FLOAT_RENDERER };

/**
 * A move's lines, under the move: `inventory_stock_transfer/{id}/inventory_stock_move/{id}/inventory_stock_move_line`.
 *
 * Read-only: the backend serves lines for reading only (the reservation engine writes them). A line has no
 * `status` of its own, so its page has no status strip.
 */
export function buildStockMoveLinePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockMoveLineListProps(),
		secondary: buildStockMoveLineDetailProps(),
	});

	return [definePage({
		routePath: c.STOCK_MOVE_LINE_ROUTE_PATH,
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockMoveLineListProps() {
	return resourceListV2Props({
		schemaName: c.STOCK_MOVE_LINE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockMoveLineCommands.SEARCH,
		fieldRenderers: MOVE_LINE_RENDERERS,
		createEnabled: false,
		// The route's move; locked, so the list never widens past it.
		staticGraph: { if: ['move_id', '=', '${move_id}'] },
		parentLink: '../',
		parentResource: c.STOCK_MOVE_SCHEMA_NAME,
		testId: 'inventory.stockMoveLineList',
	});
}

function buildStockMoveLineDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.STOCK_MOVE_LINE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'product_variant_id' },
		titleLvl2: { schemaField: 'move_id' },
		backLinkTitle: { linkHref: '../' },
		fieldRenderers: MOVE_LINE_RENDERERS,
		parentLink: '../../',
		parentResource: c.STOCK_MOVE_SCHEMA_NAME,
		standardActionCommands: { getById: StockMoveLineCommands.GET_BY_ID },
		childrenNodes: [buildStockMoveLineFieldsSection()],
		testId: 'inventory.stockMoveLineDetail',
	});
}

function buildStockMoveLineFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['move_id', 'transfer_id', 'product_variant_id', 'quantity', 'uom_id', 'picked', 'operation_at'],
		}),
		resourceFormColumnNode({
			header: 'form.movement',
			fields: ['source_location_id', 'destination_location_id'],
			relationSearch: c.directTransferLocationSearch('source_location_id', 'destination_location_id'),
		}),
		resourceFormColumnNode({
			// A read-mode field with no value is hidden, so an untracked line does not show this block.
			header: 'form.identification',
			fields: ['lot_id', 'lot_name', 'package_ref', 'result_package_ref', 'owner_ref'],
		}),
	]);
}
