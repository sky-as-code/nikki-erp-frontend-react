import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import { resourceDetailProps, resourceListProps, resourceSplitViewProps } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { StockLocationCommands } from '../features/stockLocation/commands';


export function buildStockLocationPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockLocationListProps(),
		secondary: buildStockLocationDetailProps(),
	});

	return [definePage({
		routePath: 'stock_locations',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockLocationListProps() {
	return resourceListProps({
		schemaName: c.STOCK_LOCATION_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockLocationCommands.SEARCH,
		createEnabled: true,
		deleteCommand: StockLocationCommands.DELETE,
		archiveCommand: StockLocationCommands.SET_IS_ARCHIVED,
		updateSaveCommand: StockLocationCommands.UPDATE,
		fieldRenderers: {
			// Only `internal` holds company-owned stock, so the colours separate it from the
			// counterparty and virtual locations rather than giving each type its own hue.
			location_type: {
				renderer: 'badge',
				colorMap: {
					internal: 'green',
					customer: 'blue',
					supplier: 'indigo',
					inventory_loss: 'orange',
					scrap: 'red',
					transit: 'gray',
				},
				prefix: 'location_type.',
			},
		},
	});
}

function buildStockLocationDetailProps() {
	return resourceDetailProps({
		schemaName: c.STOCK_LOCATION_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: StockLocationCommands.GET_BY_ID,
			create: StockLocationCommands.CREATE,
			update: StockLocationCommands.UPDATE,
			delete: StockLocationCommands.DELETE,
			archive: StockLocationCommands.SET_IS_ARCHIVED,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['code', 'name', 'location_type', 'parent_location_id', 'description', 'org_id'],
		}, {
			header: 'form.audit',
			fields: ['created_at', 'updated_at'],
		}],
	});
}
