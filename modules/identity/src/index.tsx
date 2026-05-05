import { SchemaRegisterOptions, schemaRegistry } from '@nikkierp/common/dynamic_model';
import { RequestMaker } from '@nikkierp/common/request';
import { ACTIONS, RESOURCES } from '@nikkierp/shell/userContext';
import { useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { PermissionGuard } from '@nikkierp/ui/components';
import { initMicroAppStateContext, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter,
} from '@nikkierp/ui/microApp';
import React from 'react';
import { Navigate } from 'react-router';

import { GROUP_SCHEMA_NAME, ORGANIZATION_SCHEMA_NAME, ORG_UNIT_SCHEMA_NAME, USER_SCHEMA_NAME } from './constants';
import { reducer } from './features/user/userSlice';
// import { reducer } from './appState';
// import { useMenuBarItems, useOrgScopeRef } from './hooks';
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
	const { orgSlug } = useActiveOrgModule();
	// const orgContextScope = { scopeType: 'org' as const, scopeRef: orgScopeRef ?? '' };
	const dispatch = useMicroAppDispatch();
	// const menuBarItems = useMenuBarItems(orgContextScope);
	// useSetMenuBarItems(menuBarItems, dispatch);

	// Trick to run once & synchronously
	React.useMemo(() => {
		registerModelSchemas();
	}, []);

	return (
		<MicroAppProvider {...props}>
			<MicroAppRouter
				domType={props.domType}
				basePath={props.routing.basePath}
				widgetName={props.widgetName}
				widgetProps={props.widgetProps}
			>
				<AppRoutes>
					{/* <AppRoute index element={<Navigate to='overview' replace />} />
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
					<AppRoute path='hierarchy-levels/:hierarchyId' element={<OrgUnitFormPage variant='update' />} /> */}
				</AppRoutes>
				{/* <WidgetRoutes>
						<WidgetRoute name='org-home' Component={OrgHomePage} />
						<WidgetRoute name='module-management' Component={ModuleManagementPage} />
					</WidgetRoutes> */}
			</MicroAppRouter>
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

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);

		return {
			domType,
		};
	},
};

export default bundle;

function registerModelSchemas(): void {
	const baseOpts: Pick<SchemaRegisterOptions, 'requestMaker'> = {
		requestMaker: RequestMaker.default(),
	};

	schemaRegistry.register([{
		...baseOpts,
		schemaName: GROUP_SCHEMA_NAME,
		resourcePath: 'v1/identity/groups',
	}, {
		...baseOpts,
		schemaName: ORGANIZATION_SCHEMA_NAME,
		resourcePath: 'v1/identity/organizations',
	}, {
		...baseOpts,
		schemaName: ORG_UNIT_SCHEMA_NAME,
		resourcePath: 'v1/identity/orgunits',
	}, {
		...baseOpts,
		schemaName: USER_SCHEMA_NAME,
		resourcePath: 'v1/identity/users',
	}]);
}