import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { InventoryLocationCommands } from '../../features/inventory/inventoryLocation/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildInventoryLocationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildInventoryLocationListProps(),
		secondary: buildInventoryLocationDetailProps(),
	});

	return [definePage({
		routePath: 'inventory_location',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildInventoryLocationListProps() {
	return resourceListV2Props({
		schemaName: c.INVENTORY_LOCATION_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: InventoryLocationCommands.SEARCH,
		createEnabled: true,
		deleteCommand: InventoryLocationCommands.DELETE,
		archiveCommand: InventoryLocationCommands.SET_IS_ARCHIVED,
		updateSaveCommand: InventoryLocationCommands.UPDATE,
		updateCommand: InventoryLocationCommands.UPDATE,
		fieldRenderers: {
			// Only `internal` holds company-owned stock, so the colours separate it from the
			// counterparty and virtual locations rather than giving each usage its own hue.
			location_usage: {
				renderer: 'badge',
				colorMap: {
					internal: 'green',
					customer: 'blue',
					vendor: 'indigo',
					inventory_loss: 'orange',
					scrap: 'red',
					transit: 'gray',
					virtual: 'gray',
				},
				prefix: 'location_usage.',
			},
			// Suspended is a temporary lock rather than a retirement, so it reads as a warning
			// rather than an error: the location is still there and still holds whatever it held.
			status: {
				renderer: 'badge',
				colorMap: {
					active: 'green',
					suspended: 'orange',
				},
				prefix: 'location_status.',
			},
		},
	});
}

function buildInventoryLocationDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.INVENTORY_LOCATION_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'canonical_name' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: InventoryLocationCommands.GET_BY_ID,
			create: InventoryLocationCommands.CREATE,
			update: InventoryLocationCommands.UPDATE,
			delete: InventoryLocationCommands.DELETE,
			archive: InventoryLocationCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildInventoryLocationFieldsSection()],
		childrenNodes: [buildInventoryLocationFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildInventoryLocationFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.identification',
			fields: ['name', 'status', 'description', 'barcode'],
		}),
		resourceFormColumnNode({
			// warehouse_id is inherited from the parent location by the backend (null for a vendor,
			// customer or shared transit location), so it is shown but never edited.
			header: 'form.locationTopology',
			fields: ['location_usage', 'purpose', 'parent_location_id', 'warehouse_id'],
		}),
		resourceFormColumnNode({
			header: 'form.storagePolicy',
			fields: ['is_replenishment_destination', 'storage_category_id', 'removal_strategy'],
		}),
	]);
}
