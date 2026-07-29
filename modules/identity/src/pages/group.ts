import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	resourceDetailProps, resourceListProps, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { GroupCommands } from '../features/group/commands';


export function buildGroupPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildGroupListProps(),
		secondary: buildGroupDetailProps(),
	});

	return [definePage({
		routePath: 'groups',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildGroupListProps() {
	return resourceListProps({
		schemaName: c.GROUP_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		linkField: 'id',
		searchCommand: GroupCommands.SEARCH,
		createEnabled: true,
		deleteCommand: GroupCommands.DELETE,
		updateSaveCommand: GroupCommands.UPDATE,
		extraActions: [
			{ label: 'action.delete', command: GroupCommands.DELETE, supportMultiple: true, requireSelection: true },
		],
	});
}

function buildGroupDetailProps() {
	return resourceDetailProps({
		schemaName: c.GROUP_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'description' },
		titleLvl3: { linkHref: '../' },
		standardActionCommands: {
			getById: GroupCommands.GET_BY_ID,
			create: GroupCommands.CREATE,
			update: GroupCommands.UPDATE,
			delete: GroupCommands.DELETE,
		},
		formSections: [{
			header: 'form.generalInformation',
			fields: ['name', 'description'],
		}],
	});
}
