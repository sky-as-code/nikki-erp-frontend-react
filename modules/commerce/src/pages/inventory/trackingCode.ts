import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { StockMoveLineCommands } from '../../features/inventory/stockMoveLine/commands';
import { StockQuantCommands } from '../../features/inventory/stockQuant/commands';
import { TrackingCodeCommands } from '../../features/inventory/trackingCode/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const FLOAT_RENDERER = { renderer: 'float' };
const TRACKING_TYPE_RENDERER = { renderer: 'translated', prefix: 'tracking_type.' };
const VALUATION_FIELDS = ['cost', 'average_cost', 'total_value', 'quantity_on_hand', 'current_location_id'];
const VALUATION_RENDERERS = {
	quantity_on_hand: FLOAT_RENDERER,
	cost: FLOAT_RENDERER,
	average_cost: FLOAT_RENDERER,
	total_value: FLOAT_RENDERER,
	tracking_type: TRACKING_TYPE_RENDERER,
};

/**
 * Tracking codes, i.e. lots and serial numbers (BR inventory/06 §5): the master every tracked balance and
 * movement names.
 */
export function buildTrackingCodePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildTrackingCodeListProps(),
		secondary: buildTrackingCodeDetailProps(),
	});

	return [definePage({
		routePath: c.TRACKING_CODE_SCHEMA_NAME,
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildTrackingCodeListProps() {
	return resourceListV2Props({
		schemaName: c.TRACKING_CODE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: TrackingCodeCommands.SEARCH,
		createEnabled: true,
		deleteCommand: TrackingCodeCommands.DELETE,
		archiveCommand: TrackingCodeCommands.SET_IS_ARCHIVED,
		updateSaveCommand: TrackingCodeCommands.UPDATE,
		updateCommand: TrackingCodeCommands.UPDATE,
		fieldRenderers: VALUATION_RENDERERS,
	});
}

function buildTrackingCodeDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.TRACKING_CODE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'tracking_code' },
		titleLvl2: { schemaField: 'product_variant_id' },
		backLinkTitle: { linkHref: '../' },
		fieldRenderers: VALUATION_RENDERERS,
		standardActionCommands: {
			getById: TrackingCodeCommands.GET_BY_ID,
			create: TrackingCodeCommands.CREATE,
			update: TrackingCodeCommands.UPDATE,
			delete: TrackingCodeCommands.DELETE,
			archive: TrackingCodeCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildTrackingCodeFieldsSection(true)],
		childrenNodes: [buildTrackingCodeFieldsSection(false)],
		relatedResources: [
			buildTrackingCodeMovementsResource(),
			buildTrackingCodeStockResource(),
			...buildTrackingCodeProductionResources(),
		],
		testId: 'inventory.trackingCodeDetail',
	});
}

function buildTrackingCodeFieldsSection(creating: boolean): ComponentNode {
	const columns = [
		resourceFormColumnNode({
			header: 'form.identification',
			fields: ['tracking_code', 'tracking_type', 'product_variant_id', 'internal_reference', 'note'],
			readOnlyFields: creating ? undefined : ['tracking_type'],
			relationSearch: {
				product_variant_id: {
					fixedGraph: { if: ['product_template_inventory_tracking', 'in', ['lot', 'serial']] },
				},
			},
		}),
		resourceFormColumnNode({
			header: 'form.valuation',
			fields: creating ? ['cost'] : VALUATION_FIELDS,
		}),
	];
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, columns);
}

/**
 * Every executed line naming the lot (LOT-TRC-01): receipts, deliveries, internal moves, returns and
 * scraps alike. A line is executed once `picked`; a reservation still pending is not history.
 */
function buildTrackingCodeMovementsResource() {
	return {
		label: 'tabs.movements',
		schemaName: c.STOCK_MOVE_LINE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: StockMoveLineCommands.SEARCH,
		initialGraph: { and: [{ if: ['lot_id', '=', '${id}'] }, { if: ['picked', '=', true] }] },
		fields: ['operation_at', 'transfer_id', 'source_location_id', 'destination_location_id', 'quantity', 'uom_id'],
		fieldRenderers: { quantity: FLOAT_RENDERER },
		linkField: 'transfer_id',
		linkRoutePath: c.STOCK_TRANSFER_SCHEMA_NAME,
		testId: 'inventory.trackingCodeMovements',
	};
}

/** Where the lot is now (LOT-TRC-02). */
function buildTrackingCodeStockResource() {
	return {
		label: 'tabs.stock',
		schemaName: c.STOCK_QUANT_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		searchCommand: StockQuantCommands.SEARCH,
		initialGraph: { if: ['lot_id', '=', '${id}'] },
		fields: ['location_id', 'on_hand_quantity', 'reserved_quantity', 'available_quantity', 'base_uom_id'],
		fieldRenderers: {
			on_hand_quantity: FLOAT_RENDERER,
			reserved_quantity: FLOAT_RENDERER,
			available_quantity: FLOAT_RENDERER,
		},
		linkField: 'id',
		linkRoutePath: c.STOCK_QUANT_SCHEMA_NAME,
		testId: 'inventory.trackingCodeStock',
	};
}

/**
 * What Production recorded about the lot or serial (LOT-TRC-03): its quality checks and, for a serial,
 * the assembly it identifies. Literal schema names: Production is another micro-app.
 */
function buildTrackingCodeProductionResources() {
	return [
		{
			label: 'tabs.quality_checks',
			schemaName: 'quality_check',
			translationNs: 'production',
			searchCommand: resourceCommands('quality_check').SEARCH,
			initialGraph: { if: ['lot_id', '=', '${id}'] },
			fields: ['check_number', 'test_type', 'checked_at', 'state'],
			linkField: 'id',
			linkRoutePath: '/production/quality_check',
			testId: 'inventory.trackingCodeQualityChecks',
		},
		{
			label: 'tabs.assemblies',
			schemaName: 'prod_assembly',
			translationNs: 'production',
			searchCommand: resourceCommands('prod_assembly').SEARCH,
			initialGraph: { if: ['serial_id', '=', '${id}'] },
			fields: ['code', 'product_variant_id', 'status'],
			linkField: 'id',
			linkRoutePath: '/production/prod_assembly',
			testId: 'inventory.trackingCodeAssemblies',
		},
	];
}
