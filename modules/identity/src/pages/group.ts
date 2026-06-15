import {
	PageNode, RESOURCE_SPLIT_VIEW_TEMPLATE, ResourceDetailTemplateProps, ResourceListTemplateProps,
	ResourceSplitViewTemplateProps,
} from '@nikkierp/ui/viewEngine';

import * as c from '../constants';
import { GroupCommands } from '../features/group/commands';


export function registerGroupPages(): PageNode[] {
	return [createGroupSplitViewPage()];
}

function createGroupSplitViewPage(): PageNode {
	return {
		type: 'page',
		routePath: 'groups',
		template: RESOURCE_SPLIT_VIEW_TEMPLATE,
		props: createGroupSplitViewProps(),
	};
}

function createGroupSplitViewProps(): ResourceSplitViewTemplateProps {
	return new ResourceSplitViewTemplateProps({
		primaryProps: createGroupListProps(),
		secondaryProps: createGroupDetailProps(),
	});
}

function createGroupListProps(): ResourceListTemplateProps {
	return new ResourceListTemplateProps({
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

function createGroupDetailProps(): ResourceDetailTemplateProps {
	return new ResourceDetailTemplateProps({
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
