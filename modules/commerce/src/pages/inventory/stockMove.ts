import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { StockMoveCommands } from '../../features/inventory/stockMove/commands';
import { StockMoveLineCommands } from '../../features/inventory/stockMoveLine/commands';
import { moveDetailedOperationsNode } from '../../viewkit/inventory/props';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const FLOAT_RENDERER = { renderer: 'float' };
const MOVE_QUANTITY_RENDERERS = {
	demand_quantity: FLOAT_RENDERER,
	base_demand_quantity: FLOAT_RENDERER,
	remaining_quantity: FLOAT_RENDERER,
};

/** One colour map for the list badge and the detail status strip, so both read alike. */
export const MOVE_STATUS_BADGE = {
	renderer: 'badge',
	colorMap: {
		draft: 'gray',
		waiting: 'yellow',
		confirmed: 'blue',
		partially_available: 'orange',
		assigned: 'green',
		done: 'teal',
		cancelled: 'red',
	},
	prefix: 'move_status.',
} as const;

/** From the move detail's own route (`…/:transfer_id/inventory_stock_move/:id`), so `:id` is the move. */
const MOVE_LINES_ROUTE_PATH = `${c.STOCK_MOVE_ROUTE_PATH}/:id/${c.STOCK_MOVE_LINE_SCHEMA_NAME}`;

/**
 * A transfer's moves, under the transfer: `inventory_stock_transfer/{id}/inventory_stock_move`.
 *
 * Read-only. A move is written only through its transfer (the transfer's Moves section, while it is a
 * draft), where the template and attribute values resolve to the variant, so this page binds no write.
 */
export function buildStockMovePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockMoveListProps(),
		secondary: buildStockMoveDetailProps(),
	});

	return [definePage({
		routePath: c.STOCK_MOVE_ROUTE_PATH,
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockMoveListProps() {
	return resourceListV2Props({
		schemaName: c.STOCK_MOVE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockMoveCommands.SEARCH,
		createEnabled: false,
		// The route's transfer; locked, so the list never widens past it.
		staticGraph: { if: ['transfer_id', '=', '${transfer_id}'], order: [['sequence', 'asc']] },
		fieldRenderers: { status: MOVE_STATUS_BADGE, ...MOVE_QUANTITY_RENDERERS },
		// Opened on its own (a pasted URL), the trail starts at the transfer it belongs to.
		parentLink: '../',
		parentResource: c.STOCK_TRANSFER_SCHEMA_NAME,
		testId: 'inventory.stockMoveList',
	});
}

function buildStockMoveDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.STOCK_MOVE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		...statusStripProps({
			statuses: Object.keys(MOVE_STATUS_BADGE.colorMap),
			prefix: MOVE_STATUS_BADGE.prefix,
			alternativeEnds: ['cancelled'],
		}),
		titleLvl1: { schemaField: 'product_variant_id' },
		titleLvl2: { schemaField: 'transfer_id' },
		backLinkTitle: { linkHref: '../' },
		fieldRenderers: MOVE_QUANTITY_RENDERERS,
		parentLink: '../../',
		parentResource: c.STOCK_TRANSFER_SCHEMA_NAME,
		// getById only: an Edit here would bypass the transfer's draft rule and variant resolution.
		standardActionCommands: { getById: StockMoveCommands.GET_BY_ID },
		childrenNodes: [buildStockMoveFieldsSection()],
		relatedResources: [buildMoveLinesResource()],
		relatedResourcesHeader: 'form.move_lines',
		testId: 'inventory.stockMoveDetail',
	});
}

function buildStockMoveFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
		rightSegment: moveDetailedOperationsNode(),
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['transfer_id', 'product_variant_id', 'demand_quantity', 'uom_id', 'picked'],
		}),
		resourceFormColumnNode({
			header: 'form.movement',
			fields: ['source_location_id', 'destination_location_id', 'final_location_id', 'priority'],
			relationSearch: c.directTransferLocationSearch('source_location_id', 'destination_location_id'),
		}),
		resourceFormColumnNode({
			header: 'form.scheduling',
			fields: ['scheduled_at', 'deadline_at', 'reservation_date'],
		}),
	]);
}

/** The move's lines, each linking to its page; "All move lines" opens the move's line list. */
function buildMoveLinesResource() {
	return {
		label: 'form.move_lines',
		schemaName: c.STOCK_MOVE_LINE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: StockMoveLineCommands.SEARCH,
		initialGraph: { if: ['move_id', '=', '${id}'] },
		fields: [
			'product_variant_id', 'quantity', 'uom_id', 'source_location_id', 'destination_location_id', 'lot_id', 'lot_name',
		],
		linkField: 'id',
		linkRoutePath: MOVE_LINES_ROUTE_PATH,
		fieldRenderers: { quantity: FLOAT_RENDERER },
		showViewAll: true,
		// The nested list is already this move's lines: no `?initialGraph=` to carry.
		viewAllFiltered: false,
		viewAllLabel: 'stock_move_all_move_lines',
		viewAllType: 'link' as const,
		viewAllNavMode: 'append' as const,
		testId: 'inventory.stockMoveLines',
	};
}
