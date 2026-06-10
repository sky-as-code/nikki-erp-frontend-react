

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
	AvatarFieldRenderer, BadgeFieldRenderer, ResourceDetailTemplateProps, ResourceListTemplateProps,
	ViewEngineRouter,
} from '@nikkierp/ui/viewEngine';
import { combineReducers } from '@reduxjs/toolkit';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

import * as c from './constants';
import { reducer as groupReducer, SLICE_NAME as GROUP_SLICE_NAME } from './features/group/groupSlice';
import { reducer as orgReducer, SLICE_NAME as ORG_SLICE_NAME } from './features/organization/orgSlice';
import { User } from './features/user';
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
		resourcePath: 'v1/iam/groups',
	}, {
		...baseOpts,
		schemaName: c.ORGANIZATION_SCHEMA_NAME,
		resourcePath: 'v1/iam/organizations',
	}, {
		...baseOpts,
		schemaName: c.ORG_UNIT_SCHEMA_NAME,
		resourcePath: 'v1/iam/orgunits',
	}, {
		...baseOpts,
		schemaName: c.USER_SCHEMA_NAME,
		resourcePath: 'v1/iam/users',
	}]);
}

function registerPages(dispatch: MicroAppDispatchFn, useMicroAppSelector: UseStateSelectorFn<any>): any[] {
	return [
		createUserSplitViewPage(dispatch, useMicroAppSelector),
		// createUserDetailsPage(dispatch, useMicroAppSelector),
		// createUserListPage(dispatch, useMicroAppSelector),
	];
}

function createUserSplitViewPage(dispatch: MicroAppDispatchFn, useMicroAppSelector: UseStateSelectorFn<any>) {
	const list = createUserListPage(dispatch, useMicroAppSelector);
	const detail = createUserDetailsPage(dispatch, useMicroAppSelector);
	return {
		routePath: 'users',
		template: 'nikkierp.mantine.pages.templates.resourceSplitView.v1',
		templateProps: {
			primaryProps: list.templateProps,
			secondaryProps: detail.templateProps,
		},
	};
}

function createUserDetailsPage(dispatch: MicroAppDispatchFn, useMicroAppSelector: UseStateSelectorFn<any>) {
	return {
		routePath: 'users/:id', // param "id" is required by this template
		template: 'nikkierp.mantine.pages.templates.resourceDetails.v1',
		templateProps: new ResourceDetailTemplateProps<User>({
			schemaName: c.USER_SCHEMA_NAME,
			translationNs: c.IAM_MODULE,
			dispatch,
			titleLvl1: {
				schemaField: 'display_name',
			},
			titleLvl2: {
				schemaField: 'email',
			},
			titleLvl3: {
				linkHref: '../',
			},
			allStatuses: [
				{ value: 'draft', label: 'status.draft', color: 'grape' },
				{ value: 'invited', label: 'status.invited', color: 'indigo' },
				{ value: 'active', label: 'status.active', color: 'green' },
				{ value: 'suspended', label: 'status.suspended', color: 'orange' },
			],
			currentStatus: {
				schemaField: 'status',
			},
			standardActions: {
				useArchive: () => userSel.useSetUserIsArchived(useMicroAppSelector),
				useCreate: () => userSel.useCreateUser(useMicroAppSelector),
				useDelete: () => userSel.useDeleteUser(useMicroAppSelector),
				useGetById: () => userSel.useGetUserById(useMicroAppSelector),
				useUpdate: () => userSel.useUpdateUser(useMicroAppSelector),
			},
			contextualActions: {
				activate: {
					label: 'action.activate',
					actionHook: () => userSel.useActivateUser(useMicroAppSelector),
					condition: (resource: User) => resource.status !== 'active',
				},
				suspend: {
					label: 'action.suspend',
					actionHook: () => userSel.useSuspendUser(useMicroAppSelector),
					condition: (resource: User) => resource.status === 'active',
				},
			},
			ownPropertiesSection: [{
				header: 'form.generalInformation',
				fieldType: 'SchemaFields',
				fields: [
					'display_name', 'email',
				],
			}, {
				header: 'form.security',
				fieldType: 'SchemaFields',
				fields: [
					'created_at', 'updated_at',
				],
			}, {
				header: 'form.customFields',
				fieldType: 'CustomFields',
			}],
		}),
	};
}

function createUserListPage(dispatch: MicroAppDispatchFn, useMicroAppSelector: UseStateSelectorFn<any>) {
	return {
		routePath: 'users',
		template: 'nikkierp.mantine.pages.templates.resourceList.v1',
		templateProps: new ResourceListTemplateProps({
			schemaName: c.USER_SCHEMA_NAME,
			translationNs: c.IAM_MODULE,
			dispatch,
			standardActions: {
				createEnabled: true,
				useSearch: () => userSel.useSearchUsers(useMicroAppSelector),
				useArchive: () => userSel.useSetUserIsArchived(useMicroAppSelector),
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
			linkField: 'id',
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