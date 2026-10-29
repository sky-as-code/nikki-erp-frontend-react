import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { InventoryLocationCommands } from '../../features/inventory/inventoryLocation/commands';
import { PutawayRuleCommands } from '../../features/inventory/putawayRule/commands';
import { SupplyRelationCommands } from '../../features/inventory/supplyRelation/commands';
import { WarehouseCommands } from '../../features/inventory/warehouse/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildWarehousePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildWarehouseListProps(),
		secondary: buildWarehouseDetailProps(),
	});

	return [definePage({
		routePath: 'inventory_warehouse',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildWarehouseListProps() {
	return resourceListV2Props({
		schemaName: c.WAREHOUSE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: WarehouseCommands.SEARCH,
		createEnabled: true,
		deleteCommand: WarehouseCommands.DELETE,
		archiveCommand: WarehouseCommands.SET_IS_ARCHIVED,
		updateSaveCommand: WarehouseCommands.UPDATE,
		updateCommand: WarehouseCommands.UPDATE,
		fieldRenderers: {
			// Suspended is a temporary close rather than a retirement, so it reads as a warning
			// rather than an error: the warehouse is expected back.
			status: {
				renderer: 'badge',
				colorMap: {
					active: 'green',
					suspended: 'orange',
				},
				prefix: 'warehouse_status.',
			},
			warehouse_role: {
				renderer: 'badge',
				colorMap: {
					central: 'indigo',
					sub: 'blue',
					pos: 'teal',
					other: 'gray',
				},
				prefix: 'warehouse_role.',
			},
		},
	});
}

function buildWarehouseDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.WAREHOUSE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: WarehouseCommands.GET_BY_ID,
			create: WarehouseCommands.CREATE,
			update: WarehouseCommands.UPDATE,
			delete: WarehouseCommands.DELETE,
			archive: WarehouseCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildWarehouseFieldsSection()],
		childrenNodes: [buildWarehouseFieldsSection()],
		relatedResources: buildWarehouseResources(),
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildWarehouseFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.identification',
			fields: ['code', 'name', 'warehouse_role', 'status', 'root_location_id'],
		}),
		resourceFormColumnNode({
			// Flows are policy: changing one provisions the locations the new shape needs and
			// creates no movement, so they sit apart from the descriptive fields above.
			header: 'form.warehouseFlows',
			fields: ['incoming_flow', 'outgoing_flow'],
		}),
		resourceFormColumnNode({
			header: 'form.contactInformation',
			fields: ['manager_user_id', 'address', 'notes'],
		}),
	]);
}

/**
 * The three sets of records that hang off a warehouse.
 *
 * They render only in update mode, which is correct: during create there is no id to filter by
 * yet, and a warehouse's locations do not exist until it has been created.
 */
function buildWarehouseResources() {
	return [
		{
			label: 'warehouse_sections_locations',
			schemaName: c.INVENTORY_LOCATION_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: InventoryLocationCommands.SEARCH,
			initialGraph: { if: ['warehouse_id', '=', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'inventory_location',
		},
		{
			label: 'warehouse_sections_putawayRules',
			schemaName: c.PUTAWAY_RULE_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: PutawayRuleCommands.SEARCH,
			initialGraph: { if: ['warehouse_id', '=', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'inventory_putaway_rule',
		},
		{
			label: 'warehouse_sections_supplyRelations',
			schemaName: c.SUPPLY_RELATION_SCHEMA_NAME,
			translationNs: c.INVENTORY_MODULE,
			searchCommand: SupplyRelationCommands.SEARCH,
			// Routes into this warehouse: who is allowed to restock it.
			initialGraph: { if: ['destination_warehouse_id', '=', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'inventory_warehouse_supply_relation',
		},
	];
}
