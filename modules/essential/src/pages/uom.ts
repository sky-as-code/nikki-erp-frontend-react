import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailProps, resourceFormColumnNode, resourceListProps,
	resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { UomCommands } from '../features/uom/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


export function buildUomPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildUomListProps(),
		secondary: buildUomDetailProps(),
	});

	return [definePage({
		routePath: 'uoms',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildUomListProps() {
	return resourceListProps({
		schemaName: c.UOM_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		linkField: 'id',
		searchCommand: UomCommands.SEARCH,
		createEnabled: true,
		deleteCommand: UomCommands.DELETE,
		// BR-UOM-ESS-019: a UoM in use is archived, never deleted, so that historical
		// documents keep their meaning.
		archiveCommand: UomCommands.SET_IS_ARCHIVED,
		updateSaveCommand: UomCommands.UPDATE,
		fieldRenderers: {
			uom_type: {
				renderer: 'badge',
				colorMap: { reference: 'blue', bigger_equal: 'green', smaller: 'orange' },
				prefix: 'uom_type.',
			},
		},
	});
}

function buildUomDetailProps() {
	return resourceDetailProps({
		schemaName: c.UOM_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'symbol' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: UomCommands.GET_BY_ID,
			create: UomCommands.CREATE,
			update: UomCommands.UPDATE,
			delete: UomCommands.DELETE,
			archive: UomCommands.SET_IS_ARCHIVED,
		},
		createNodes: [buildUomFieldsSection()],
		childrenNodes: [buildUomFieldsSection()],
	});
}

/** Shared by both form modes: the resource's own fields, as titled blocks. */
function buildUomFieldsSection(): ComponentNode {
	return collapsibleSectionNode(
		{ layout: 'formBlocks' },
		[
			resourceFormColumnNode({
				header: 'form.generalInformation',
				fields: ['name', 'symbol', 'category_id', 'org_id'],
			}),
			resourceFormColumnNode({
				// BR-UOM-ESS-016: the factor and the rounding precision are independent concepts,
				// so they are shown together but never presented as substitutes for one another.
				header: 'form.conversion',
				fields: ['uom_type', 'factor', 'rounding'],
			}),
			resourceFormColumnNode({
				header: 'form.audit',
				fields: ['created_at', 'updated_at'],
			}),
		],
	);
}
