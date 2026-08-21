import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps, resourceTableNode,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { UomCommands } from '../features/uom/commands';
import { UomCatCommands } from '../features/uomcat/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildUomCatPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildUomCatListProps(),
		secondary: buildUomCatDetailProps(),
	});

	return [definePage({
		routePath: 'uom-categories',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildUomCatListProps() {
	return resourceListProps({
		schemaName: c.UOMCAT_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		linkField: 'id',
		searchCommand: UomCatCommands.SEARCH,
		createEnabled: true,
		deleteCommand: UomCatCommands.DELETE,
		archiveCommand: UomCatCommands.SET_IS_ARCHIVED,
		updateSaveCommand: UomCatCommands.UPDATE,
	});
}

function buildUomCatDetailProps() {
	return resourceDetailProps({
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
		childrenNodes: [buildUomCatFieldsSection(), ...buildCategoryUomSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildUomCatFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				// BR-UOM-ESS-003: the Reference UoM is a property of the category, and every factor
				// in the category is expressed relative to it.
				header: 'form.generalInformation',
				fields: ['name', 'reference_uom_id', 'org_id'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['created_at', 'updated_at'],
			}),
		],
	);
}

/**
 * The UoMs of the category. `category_id` is a plain foreign key rather than a many edge, so
 * this filters on equality instead of the `linked` operator the IAM assignment pages use.
 */
function buildCategoryUomSection(): ComponentNode[] {
	return [
		collapsibleSectionNode(
			{ header: 'uom_sections_uoms', translationNs: c.ESSENTIAL_MODULE, expanded: true },
			[resourceTableNode({
				schemaName: c.UOM_SCHEMA_NAME,
				translationNs: c.ESSENTIAL_MODULE,
				searchCommand: UomCommands.SEARCH,
				filterGraph: { if: ['category_id', '=', '${id}'] },
				linkField: 'id',
				linkRoutePath: 'uoms',
			})],
		),
	];
}
