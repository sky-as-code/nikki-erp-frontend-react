import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import { resourceDetailProps, resourceListProps, resourceSplitViewProps } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { SupplyRelationCommands } from '../features/supplyRelation/commands';


export function buildSupplyRelationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSupplyRelationListProps(),
		secondary: buildSupplyRelationDetailProps(),
	});

	return [definePage({
		routePath: 'supply_relations',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSupplyRelationListProps() {
	return resourceListProps({
		schemaName: c.SUPPLY_RELATION_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: SupplyRelationCommands.SEARCH,
		createEnabled: true,
		deleteCommand: SupplyRelationCommands.DELETE,
		archiveCommand: SupplyRelationCommands.SET_IS_ARCHIVED,
		updateSaveCommand: SupplyRelationCommands.UPDATE,
	});
}

function buildSupplyRelationDetailProps() {
	return resourceDetailProps({
		schemaName: c.SUPPLY_RELATION_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'source_warehouse_id' },
		titleLvl2: { schemaField: 'destination_warehouse_id' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: SupplyRelationCommands.GET_BY_ID,
			create: SupplyRelationCommands.CREATE,
			update: SupplyRelationCommands.UPDATE,
			delete: SupplyRelationCommands.DELETE,
			archive: SupplyRelationCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			// Declaring a route reserves nothing and starts no transfer. When replenishment
			// actually happens the Stock movement engine creates the movement.
			header: 'form.generalInformation',
			fields: [
				'source_warehouse_id', 'destination_warehouse_id', 'priority', 'is_default', 'org_id',
			],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
	});
}
