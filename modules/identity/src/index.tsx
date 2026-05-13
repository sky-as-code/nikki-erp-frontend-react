

import { SchemaRegisterOptions, schemaRegistry } from '@nikkierp/common/dynamic_model';
import { RequestMaker } from '@nikkierp/common/request';
import { ACTIONS, RESOURCES } from '@nikkierp/shell/userContext';
import { ThunkPackHookReturn } from '@nikkierp/ui/appState';
import { useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { PermissionGuard } from '@nikkierp/ui/components';
import { initMicroAppStateContext, MicroAppDispatchFn, useMicroAppDispatch, useMicroAppSelector, UseStateSelectorFn } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter,
} from '@nikkierp/ui/microApp';
import {
	AvatarFieldRenderer, BadgeFieldRenderer, ResourceListTemplateProps, ViewEngineRouter,
} from '@nikkierp/ui/viewEngine';
import { combineReducers } from '@reduxjs/toolkit';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

import * as c from './constants';
import { reducer as groupReducer, SLICE_NAME as GROUP_SLICE_NAME } from './features/group/groupSlice';
import { reducer as orgReducer, SLICE_NAME as ORG_SLICE_NAME } from './features/organization/orgSlice';
import * as userSel from './features/user/userSelectors';
import {
	reducer as userReducer, SLICE_NAME as USER_SLICE_NAME,
} from './features/user/userSlice';
// import { reducer } from './appState';
import { useIdentityMenuBarItems } from './hooks';
// import { GroupFormPage } from './pages/group/GroupFormPage';
// import { GroupListPage } from './pages/group/GroupListPage';
// import { HierarchyListPage } from './pages/hierarchy/HierarchyListPage';
// import { OrgUnitFormPage } from './pages/hierarchy/OrgUnitFormPage';
// import { OrganizationFormPage } from './pages/organization/OrganizationFormPage';
// import { OrganizationListPage } from './pages/organization/OrganizationListPage';
// import { OverviewPage } from './pages/overview/OverviewPage';
// import { UserFormPage } from './pages/user/UserFormPage';
// import { UserListPage } from './pages/user/UserListPage';


function Main(props: MicroAppProps) {
	// const orgScopeRef = useOrgScopeRef();
	// const { orgSlug } = useActiveOrgModule();
	// const orgContextScope = { scopeType: 'org' as const, scopeRef: orgScopeRef ?? '' };
	// const dispatch = useMicroAppDispatch();

	return (
		<MicroAppProvider {...props}>
			<MicroAppInner {...props} />

			{/* <ViewEngineRouter
				microAppProps={props}
				engineProps={{ pages }}
			/>
			<MicroAppRouter
				domType={props.domType}
				basePath={props.routing.basePath}
				widgetName={props.widgetName}
				widgetProps={props.widgetProps}
			>
				<AppRoutes>
					<AppRoute index element={<Navigate to='overview' replace />} />
					<AppRoute path='overview' element={<OverviewPage />} />
					<AppRoute path='users' element={<UserListPage />} />
					<AppRoute path='users/:id' element={<UserFormPage />} />
					<AppRoute path='groups' element={<GroupListPage />} />
					<AppRoute path='groups/create' element={<GroupFormPage variant='create' />} />
					<AppRoute path='groups/:groupId' element={<GroupFormPage variant='update' />} />
					<AppRoute path='organizations' element={<OrganizationListPage />} />
					<AppRoute path='organizations/:slug' element={<OrganizationFormPage variant='update' />} />
					<AppRoute path='organizations/create' element={<OrganizationFormPage variant='create' />} />
					<AppRoute path='hierarchy-levels' element={<HierarchyListPage />} />
					<AppRoute path='hierarchy-levels/create' element={<OrgUnitFormPage variant='create' />} />
					<AppRoute path='hierarchy-levels/:hierarchyId' element={<OrgUnitFormPage variant='update' />} />
				</AppRoutes>
				<WidgetRoutes>
						<WidgetRoute name='org-home' Component={OrgHomePage} />
						<WidgetRoute name='module-management' Component={ModuleManagementPage} />
					</WidgetRoutes>
			</MicroAppRouter>
			*/}
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {

	init({ htmlTag, registerReducer }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		// Combine user reducer with other reducers
		const reducer = combineReducers({
			[USER_SLICE_NAME]: userReducer,
			[GROUP_SLICE_NAME]: groupReducer,
			[ORG_SLICE_NAME]: orgReducer,
		});

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);
		registerModelSchemas();

		return {
			domType,
		};
	},
};

export default bundle;

function MicroAppInner(props: MicroAppProps): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const menuBarItems = useIdentityMenuBarItems();

	useSetMenuBarItems(menuBarItems, dispatch);

	const pages = React.useMemo(() => registerPages(dispatch, useMicroAppSelector), []);

	return (
		<ViewEngineRouter
			microAppProps={props}
			engineProps={{ pages }}
		/>
	);
}

function registerModelSchemas(): void {
	const baseOpts: Pick<SchemaRegisterOptions, 'requestMaker'> = {
		requestMaker: RequestMaker.default(),
	};

	schemaRegistry.register([{
		...baseOpts,
		schemaName: c.GROUP_SCHEMA_NAME,
		resourcePath: 'v1/identity/groups',
	}, {
		...baseOpts,
		schemaName: c.ORGANIZATION_SCHEMA_NAME,
		resourcePath: 'v1/identity/organizations',
	}, {
		...baseOpts,
		schemaName: c.ORG_UNIT_SCHEMA_NAME,
		resourcePath: 'v1/identity/orgunits',
	}, {
		...baseOpts,
		schemaName: c.USER_SCHEMA_NAME,
		resourcePath: 'v1/identity/users',
	}]);
}

function registerPages(dispatch: MicroAppDispatchFn, useMicroAppSelector: UseStateSelectorFn<any>): any[] {
	return [
		createUserDetailsPage(),
		createUserListPage(dispatch, useMicroAppSelector),
	];
}

function createUserDetailsPage() {
	return {
		routePath: 'users/:id', // param "id" is required by this template
		template: 'nikkierp.mantine.pages.templates.resourceDetails.v1',
		templateProps: {
			schemaName: c.USER_SCHEMA_NAME,
			reduxAction: (_pathParams: {id: string}) => {},
			titleLvl1: {
				type: 'SchemaField',
				value: 'display_name',
			},
			titleLvl2: {
				type: 'SchemaField',
				value: 'email',
			},
			titleLvl3: {
				type: 'Link',
				value: 'nikkierp.identity.user.resourceName', // For type 'Link', value is the label
				linkHref: '../users',
			},
			relatedResources: [],
		},
		sections: [{
			template: 'nikkierp.mantine.pages.templates.resourceDetails.v1.sections.resourceDetails.v1',
			templateProps: {
				allStatuses: [
					{ value: 'invited', label: 'nikkierp.identity.user.status.invited' },
					{ value: 'active', label: 'nikkierp.identity.user.status.active' },
					{ value: 'locked', label: 'nikkierp.identity.user.status.locked' },
					{ value: 'terminated', label: 'nikkierp.identity.user.status.terminated' },
				],
				currentStatus: {
					type: 'SchemaField',
					value: 'status',
				},
				actions: {
					create: {
						label: 'nikkierp.identity.user.actions.create',
						reduxAction: () => {},
					},
					delete: {
						label: 'nikkierp.identity.user.actions.delete',
						reduxAction: () => {},
					},
					save: {
						label: 'nikkierp.identity.user.actions.save',
						reduxAction: () => {},
					},
				},
			},
			sections: [{
				// type: 'BuiltInFields',
				title: 'nikkierp.common.generalInformation',
				content: {
					type: 'SchemaFieldGroup',
					fields: [
						'display_name', 'email', 'status', 'created_at', 'updated_at', 'etag',
					],
				},
			}, {
				title: 'nikkierp.common.security',
			}, {
				template: 'nikkierp.mantine.pages.templates.resourceDetails.v1.sections.customFields.v1',
				title: 'nikkierp.common.customFields',
			}],
		}],
	};
}

function createUserListPage(dispatch: MicroAppDispatchFn, useMicroAppSelector: UseStateSelectorFn<any>) {
	return {
		routePath: 'users',
		template: 'nikkierp.mantine.pages.templates.resourceList.v1',
		templateProps: new ResourceListTemplateProps({
			schemaName: c.USER_SCHEMA_NAME,
			// resourceNameTransKey: 'user',
			translationNs: c.IDENTITY_MODULE,
			dispatch,
			actionHooks: {
				useSearch: () => userSel.useSearchUsers(useMicroAppSelector),
				useArchive: () => userSel.useSetUserIsArchived(useMicroAppSelector),
				useCreate: undefined,
				useDelete: () => userSel.useDeleteUser(useMicroAppSelector),
				useUpdateSave: () => userSel.useUpdateUser(useMicroAppSelector),
			},
			extraActions: [
				{
					label: 'Lock',
					supportMultiple: true,
					requireSelection: true,
					actionHook: () => null as any,
				},
				{
					label: 'Terminate',
					supportMultiple: true,
					requireSelection: true,
					actionHook: () => null as any,
				},
			],
			linkField: 'email',
			linkRoutePath: 'users/:id',
			fieldRenderer: {
				avatar_url: new AvatarFieldRenderer(),
				status: new BadgeFieldRenderer({
					colorMap: {
						invited: 'indigo',
						active: 'green',
						locked: 'orange',
						terminated: 'gray',
					},
					translationKey: (value: string) => {
						return `status.${value}`;
					},
				}),
			},
		}),
	};
}