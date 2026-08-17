import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { InventoryLocationCommands } from '../features/inventoryLocation/commands';
import { PutawayRuleCommands } from '../features/putawayRule/commands';
import { SupplyRelationCommands } from '../features/supplyRelation/commands';
import { WarehouseCommands } from '../features/warehouse/commands';


export function buildWarehousePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildWarehouseListProps(),
		secondary: buildWarehouseDetailProps(),
	});

	return [definePage({
		routePath: 'warehouses',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildWarehouseListProps() {
	return resourceListProps({
		schemaName: c.WAREHOUSE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: WarehouseCommands.SEARCH,
		createEnabled: true,
		deleteCommand: WarehouseCommands.DELETE,
		archiveCommand: WarehouseCommands.SET_IS_ARCHIVED,
		updateSaveCommand: WarehouseCommands.UPDATE,
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
	return resourceDetailProps({
		schemaName: c.WAREHOUSE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: WarehouseCommands.GET_BY_ID,
			create: WarehouseCommands.CREATE,
			update: WarehouseCommands.UPDATE,
			delete: WarehouseCommands.DELETE,
			archive: WarehouseCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['code', 'name', 'warehouse_role', 'parent_warehouse_id', 'status', 'org_id'],
		}, {
			// Flows are policy: changing one provisions the locations the new shape needs and
			// creates no movement, so they sit apart from the descriptive fields above.
			header: 'form.warehouseFlows',
			fields: ['incoming_flow', 'outgoing_flow'],
		}, {
			header: 'form.contactInformation',
			fields: ['address', 'manager_user_id', 'notes'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
		childrenNodes: buildWarehouseSections(),
	});
}

/**
 * The three sets of records that hang off a warehouse.
 *
 * They render only in update mode, which is correct: during create there is no id to filter by
 * yet, and a warehouse's locations do not exist until it has been created.
 */
function buildWarehouseSections() {
	return [
		collapsibleSectionNode({
			header: 'warehouse_sections_locations',
			translationNs: c.INVENTORY_MODULE,
		}, [
			resourceTableNode({
				schemaName: c.INVENTORY_LOCATION_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: InventoryLocationCommands.SEARCH,
				filterGraph: { if: ['warehouse_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'locations',
			}),
		]),
		collapsibleSectionNode({
			header: 'warehouse_sections_putawayRules',
			translationNs: c.INVENTORY_MODULE,
		}, [
			resourceTableNode({
				schemaName: c.PUTAWAY_RULE_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: PutawayRuleCommands.SEARCH,
				filterGraph: { if: ['warehouse_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'putaway_rules',
			}),
		]),
		collapsibleSectionNode({
			header: 'warehouse_sections_supplyRelations',
			translationNs: c.INVENTORY_MODULE,
		}, [
			resourceTableNode({
				schemaName: c.SUPPLY_RELATION_SCHEMA_NAME,
				translationNs: c.INVENTORY_MODULE,
				searchCommand: SupplyRelationCommands.SEARCH,
				// Routes into this warehouse: who is allowed to restock it.
				filterGraph: { if: ['destination_warehouse_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'supply_relations',
			}),
		]),
	];
}
