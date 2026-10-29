// Proxy copy of `nikkierp/modules/essential/src/pages/uomcat.ts`; keep in step. Commerce registers nothing for these schemas:
// the essential micro-app stays in the host and is lazy-loaded to serve them.
import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../../constants/essential';
import { UomCommands } from '../../features/essential/commands';
import { UomCatCommands } from '../../features/essential/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildUomCatPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildUomCatListProps(),
		secondary: buildUomCatDetailProps(),
	});

	return [definePage({
		routePath: 'essential_uomcat',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildUomCatListProps() {
	return resourceListV2Props({
		schemaName: c.UOMCAT_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		linkField: 'id',
		searchCommand: UomCatCommands.SEARCH,
		createEnabled: true,
		deleteCommand: UomCatCommands.DELETE,
		archiveCommand: UomCatCommands.SET_IS_ARCHIVED,
		updateSaveCommand: UomCatCommands.UPDATE,
		updateCommand: UomCatCommands.UPDATE,
	});
}

function buildUomCatDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.UOMCAT_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		titleLvl1: { schemaField: 'name' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: UomCatCommands.GET_BY_ID,
			create: UomCatCommands.CREATE,
			update: UomCatCommands.UPDATE,
			delete: UomCatCommands.DELETE,
			archive: UomCatCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildUomCatFieldsSection()],
		childrenNodes: [buildUomCatFieldsSection()],
		relatedResources: buildCategoryUomResources(),
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildUomCatFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.ESSENTIAL_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			// BR-UOM-ESS-003: the Reference UoM is a property of the category, and every factor
			// in the category is expressed relative to it.
			header: 'form.generalInformation',
			fields: ['name', 'reference_uom_id', 'org_id'],
		}),
	]);
}

/**
 * The UoMs of the category. `category_id` is a plain foreign key rather than a many edge, so
 * this filters on equality instead of the `linked` operator the IAM assignment pages use.
 */
function buildCategoryUomResources() {
	return [
		{
			label: 'uom_sections_uoms',
			schemaName: c.UOM_SCHEMA_NAME,
			translationNs: c.ESSENTIAL_MODULE,
			searchCommand: UomCommands.SEARCH,
			initialGraph: { if: ['category_id', '=', '${id}'] },
			linkField: 'id',
			linkRoutePath: 'essential_uom',
		},
	];
}
