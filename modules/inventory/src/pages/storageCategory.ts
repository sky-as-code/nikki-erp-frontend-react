import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { StorageCategoryCommands } from '../features/storageCategory/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildStorageCategoryPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildStorageCategoryListProps(),
		secondary: buildStorageCategoryDetailProps(),
	});

	return [definePage({
		routePath: 'storage_categories',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildStorageCategoryListProps() {
	return resourceListProps({
		schemaName: c.STORAGE_CATEGORY_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		linkField: 'id',
		searchCommand: StorageCategoryCommands.SEARCH,
		createEnabled: true,
		deleteCommand: StorageCategoryCommands.DELETE,
		archiveCommand: StorageCategoryCommands.SET_IS_ARCHIVED,
		updateSaveCommand: StorageCategoryCommands.UPDATE,
		fieldRenderers: {
			allow_new_item_policy: {
				renderer: 'badge',
				colorMap: {
					allow: 'green',
					same_product_only: 'blue',
					empty_only: 'orange',
				},
				prefix: 'allow_new_item_policy.',
			},
		},
	});
}

function buildStorageCategoryDetailProps() {
	return resourceDetailProps({
		schemaName: c.STORAGE_CATEGORY_SCHEMA_NAME,
		translationNs: c.INVENTORY_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'code' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: StorageCategoryCommands.GET_BY_ID,
			create: StorageCategoryCommands.CREATE,
			update: StorageCategoryCommands.UPDATE,
			delete: StorageCategoryCommands.DELETE,
			archive: StorageCategoryCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildStorageCategoryFieldsSection()],
		childrenNodes: [buildStorageCategoryFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildStorageCategoryFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['code', 'name', 'description', 'org_id'],
			}),
			resourceFormColumnNode({
				// Capacity is a limit, not a reading: what is currently stored depends on actual
				// inventory and is computed from Stock rather than held here.
				header: 'form.storagePolicy',
				fields: ['max_weight', 'allow_new_item_policy'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['created_at', 'updated_at'],
			}),
		],
	);
}
