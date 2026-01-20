import { MenuBarItem, useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import { initMicroAppStateContext, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter,
} from '@nikkierp/ui/microApp';
import React from 'react';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { GroupCreatePage } from './pages/group/GroupCreatePage';
import { GroupDetailPage } from './pages/group/GroupDetailPage';
import { GroupListPage } from './pages/group/GroupListPage';
import { HierarchyCreatePage } from './pages/hierarchy/HierarchyCreatePage';
import { HierarchyDetailPage } from './pages/hierarchy/HierarchyDetailPage';
import { HierarchyListPage } from './pages/hierarchy/HierarchyListPage';
import { OrganizationCreatePage } from './pages/organization/OrganizationCreatePage';
import { OrganizationDetailPage } from './pages/organization/OrganizationDetailPage';
import { OrganizationListPage } from './pages/organization/OrganizationListPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { UserCreatePage } from './pages/user/UserCreatePage';
import { UserDetailPage } from './pages/user/UserDetailPage';
import { UserListPage } from './pages/user/UserListPage';


const menuBarItems: MenuBarItem[] = [
	{
		label: 'Overview',
		link: `/overview`,
	},
	{
		label: 'Users',
		items: [
			{
				label: 'Users',
				link: `/users`,
			},
			{
				label: 'Groups',
				link: `/groups`,
			},
		],
	},
	{
		label: 'Organizations',
		items: [
			{
				label: 'Organizations',
				link: `/organizations`,
			},
			{
				label: 'Hierarchy Levels',
				link: `/hierarchy-levels`,
			},
		],
	},
	// {
	// 	label: 'Settings',
	// 	link: `/settings`,
	// },
];

function Main(props: MicroAppProps) {
	const dispatch = useMicroAppDispatch();
	useSetMenuBarItems(menuBarItems, dispatch);

	return (
		<MicroAppProvider {...props}>
			<MicroAppRouter domType={props.domType} basePath={props.routing.basePath}
				widgetName={props.widgetName}
				widgetProps={props.widgetProps}
			>
				<AppRoutes>
					<AppRoute index element={<Navigate to='overview' replace />} />
					<AppRoute path='overview' element={<OverviewPage />} />
					<AppRoute path='users' element={<UserListPage />} />
					<AppRoute path='users/create' element={<UserCreatePage />} />
					<AppRoute path='users/:userId' element={<UserDetailPage />} />
					<AppRoute path='groups' element={<GroupListPage />} />
					<AppRoute path='groups/create' element={<GroupCreatePage />} />
					<AppRoute path='groups/:groupId' element={<GroupDetailPage />} />
					<AppRoute path='organizations' element={<OrganizationListPage />} />
					<AppRoute path='organizations/:slug' element={<OrganizationDetailPage />} />
					<AppRoute path='organizations/create' element={<OrganizationCreatePage />} />
					<AppRoute path='hierarchy-levels' element={<HierarchyListPage />} />
					<AppRoute path='hierarchy-levels/create' element={<HierarchyCreatePage />} />
					<AppRoute path='hierarchy-levels/:hierarchyId' element={<HierarchyDetailPage />} />
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
