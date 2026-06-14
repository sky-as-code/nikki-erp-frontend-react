import { SchemaRegisterOptions, schemaRegistry } from '@nikkierp/common/dynamicModel';
import { RequestMaker } from '@nikkierp/common/request';
import { useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import {
	defineWebComponent, initMicroAppStateContext, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, useMicroAppDispatch,
} from '@nikkierp/ui/microApp';
import { PageNode, RESOURCE_SPLIT_VIEW_TEMPLATE, ViewEngineRouter } from '@nikkierp/ui/viewEngine';
import { combineReducers } from '@reduxjs/toolkit';
import React from 'react';

import * as c from './constants';
import { reducer as groupReducer, SLICE_NAME as GROUP_SLICE_NAME } from './features/group/groupSlice';
import { reducer as orgReducer, SLICE_NAME as ORG_SLICE_NAME } from './features/organization/orgSlice';
import { registerUserCommands, UserCommands } from './features/user/commands';
import { useIdentityMenuBarItems } from './hooks';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {

	init({ htmlTag, registerReducer, commandBus }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, { htmlTag, domType });

		// Group/organization features still use Redux; user data flows through the command bus.
		const reducer = combineReducers({
			[GROUP_SLICE_NAME]: groupReducer,
			[ORG_SLICE_NAME]: orgReducer,
		});
		const result = registerReducer(reducer);
		initMicroAppStateContext(result);

		registerModelSchemas();
		// Subscribe IAM command handlers synchronously so lazy command resolution can find them.
		registerUserCommands(commandBus);

		return { domType };
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const menuBarItems = useIdentityMenuBarItems();

	useSetMenuBarItems(menuBarItems, dispatch);

	const pages = React.useMemo(() => registerPages(), []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages }}
		/>
	);
}

function registerModelSchemas(): void {
	schemaRegistry.register([{
		schemaName: c.GROUP_SCHEMA_NAME,
		resourcePath: 'v1/iam/groups',
	}, {
		schemaName: c.ORGANIZATION_SCHEMA_NAME,
		resourcePath: 'v1/iam/organizations',
	}, {
		schemaName: c.ORG_UNIT_SCHEMA_NAME,
		resourcePath: 'v1/iam/orgunits',
	}, {
		schemaName: c.USER_SCHEMA_NAME,
		resourcePath: 'v1/iam/users',
	}]);
}

function registerPages(): PageNode[] {
	return [createUserSplitViewPage()];
}

function createUserSplitViewPage(): PageNode {
	return {
		type: 'page',
		routePath: 'users',
		template: RESOURCE_SPLIT_VIEW_TEMPLATE,
		props: {
			primary: createUserListProps(),
			secondary: createUserDetailProps(),
		},
	};
}

function createUserListProps(): Record<string, unknown> {
	return {
		schemaName: c.USER_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		linkField: 'id',
		standardActions: {
			createEnabled: true,
			search: UserCommands.SEARCH,
			archive: UserCommands.SET_IS_ARCHIVED,
			delete: UserCommands.DELETE,
			updateSave: UserCommands.UPDATE,
		},
		extraActions: [
			{ label: 'action.suspend', command: UserCommands.SUSPEND, supportMultiple: true, requireSelection: true },
			{ label: 'action.delete', command: UserCommands.DELETE, supportMultiple: true, requireSelection: true },
		],
		fieldRenderer: {
			avatar_url: { renderer: 'avatar' },
			status: {
				renderer: 'badge',
				prefix: 'status.',
				colorMap: {
					invited: 'indigo',
					active: 'green',
					locked: 'orange',
					terminated: 'gray',
				},
			},
		},
	};
}

function createUserDetailProps(): Record<string, unknown> {
	return {
		schemaName: c.USER_SCHEMA_NAME,
		translationNs: c.IAM_MODULE,
		titleLvl1: { schemaField: 'display_name' },
		titleLvl2: { schemaField: 'email' },
		titleLvl3: { linkHref: '../' },
		allStatuses: [
			{ value: 'draft', label: 'status.draft', color: 'grape' },
			{ value: 'invited', label: 'status.invited', color: 'indigo' },
			{ value: 'active', label: 'status.active', color: 'green' },
			{ value: 'suspended', label: 'status.suspended', color: 'orange' },
		],
		currentStatus: { schemaField: 'status' },
		standardActions: {
			getById: UserCommands.GET_BY_ID,
			create: UserCommands.CREATE,
			update: UserCommands.UPDATE,
			delete: UserCommands.DELETE,
			archive: UserCommands.SET_IS_ARCHIVED,
		},
		contextualActions: {
			activate: {
				label: 'action.activate',
				command: UserCommands.ACTIVATE,
				condition: { field: 'status', operator: 'not_equal', value: 'active' },
			},
			suspend: {
				label: 'action.suspend',
				command: UserCommands.SUSPEND,
				condition: { field: 'status', operator: 'equal', value: 'active' },
			},
		},
		ownPropertiesSection: [{
			header: 'form.generalInformation',
			fieldType: 'SchemaFields',
			fields: ['display_name', 'email'],
		}, {
			header: 'form.security',
			fieldType: 'SchemaFields',
			fields: ['created_at', 'updated_at'],
		}, {
			header: 'form.customFields',
			fieldType: 'CustomFields',
		}],
	};
}
