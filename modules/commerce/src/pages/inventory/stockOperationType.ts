import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/inventory';
import { StockOperationTypeCommands } from '../../features/inventory/stockOperationType/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildStockOperationTypePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStockOperationTypeListProps(),
		secondary: buildStockOperationTypeDetailProps(),
	});

	return [definePage({
		routePath: 'inventory_stock_operation_type',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStockOperationTypeListProps() {
	return resourceListV2Props({
		schemaName: c.STOCK_OPERATION_TYPE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StockOperationTypeCommands.SEARCH,
		createEnabled: true,
		deleteCommand: StockOperationTypeCommands.DELETE,
		archiveCommand: StockOperationTypeCommands.SET_IS_ARCHIVED,
		updateSaveCommand: StockOperationTypeCommands.UPDATE,
		updateCommand: StockOperationTypeCommands.UPDATE,
		fieldRenderers: buildStockOperationTypeBadges(),
	});
}

/** The four policies are enums: each value reads as a translated badge. */
function buildStockOperationTypeBadges() {
	return {
		operation_code: {
			renderer: 'badge',
			colorMap: { incoming: 'green', outgoing: 'orange', internal: 'blue' },
			prefix: 'operation_code.',
		},
		reservation_method: {
			renderer: 'badge',
			colorMap: { at_confirmation: 'teal', manual: 'gray', before_scheduled_date: 'indigo' },
			prefix: 'reservation_method.',
		},
		backorder_policy: {
			renderer: 'badge',
			colorMap: { ask: 'yellow', always: 'blue', never: 'red' },
			prefix: 'backorder_policy.',
		},
		shipping_policy: {
			renderer: 'badge',
			colorMap: { partial: 'cyan', all_at_once: 'violet' },
			prefix: 'shipping_policy.',
		},
	} as const;
}

function buildStockOperationTypeDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.STOCK_OPERATION_TYPE_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: StockOperationTypeCommands.GET_BY_ID,
			create: StockOperationTypeCommands.CREATE,
			update: StockOperationTypeCommands.UPDATE,
			delete: StockOperationTypeCommands.DELETE,
			archive: StockOperationTypeCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildStockOperationTypeFieldsSection()],
		childrenNodes: [buildStockOperationTypeFieldsSection()],
	});
}

/**
 * Shared by both form modes. A transfer copies the type's policies when it is created, so changing
 * them here affects only the transfers created afterwards.
 */
function buildStockOperationTypeFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.INVENTORY_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['code', 'name', 'operation_code'],
		}),
		resourceFormColumnNode({
			header: 'form.defaultLocations',
			fields: ['default_source_location_id', 'default_destination_location_id'],
		}),
		resourceFormColumnNode({
			header: 'form.reservation',
			fields: ['reservation_method', 'reserve_before_days'],
		}),
		resourceFormColumnNode({
			header: 'form.policies',
			fields: ['backorder_policy', 'shipping_policy'],
		}),
	]);
}
