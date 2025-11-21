import { MantineProvider } from '@mantine/core';
import { MenuBarItem, useSetMenuBarItems } from '@nikkierp/ui/appState';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext, useMicroAppDispatch,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { ActionListPage } from './pages/action/ActionListPage';
import { EntitlementListPage } from './pages/entitlement/EntitlementListPage';
import { GrantRequestListPage } from './pages/grantRequest/GrantRequestListPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { ResourceDetailPage } from './pages/resource/ResourceDetailPage';
import { ResourceListPage } from './pages/resource/ResourceListPage';
import { RevokeRequestListPage } from './pages/revokeRequest/RevokeRequestListPage';
import { RoleDetailPage } from './pages/role/RoleDetailPage';
import { RoleListPage } from './pages/role/RoleListPage';
import { RoleSuiteListPage } from './pages/role_suite/RoleSuiteListPage';


const menuBarItems: MenuBarItem[] = [
	{
		label: 'Overview',
		link: '/overview',
	},
	{
		label: 'Resources & Actions',
		items: [
			{
				label: 'Resources',
				link: '/resources',
			},
			{
				label: 'Actions',
				link: '/actions',
			},
			{
				label: 'Entitlements',
				link: '/entitlements',
			},
		],
	},
	{
		label: 'Roles',
		items: [
			{
				label: 'Roles',
				link: '/roles',
			},
			{
				label: 'Role Suites',
				link: '/role-suites',
			},
		],
	},
	{
		label: 'Requests',
		items: [
			{
				label: 'Grant Requests',
				link: '/grant-requests',
			},
			{
				label: 'Revoke Requests',
				link: '/revoke-requests',
			},
		],
	},
];

function Main(props: MicroAppProps) {
	const dispatch = useMicroAppDispatch();
	useSetMenuBarItems(menuBarItems, dispatch);

	return (
		<MicroAppProvider {...props}>
			<MantineProvider>
				<MicroAppRouter
					domType={props.domType}
					basePath={props.routing.basePath}
					widgetName={props.widgetName}
					widgetProps={props.widgetProps}
				>
					<AppRoutes>
						<AppRoute index element={<Navigate to='overview' replace />} />
						<AppRoute path='overview' element={<OverviewPage />} />
						<AppRoute path='resources' element={<ResourceListPage />} />
						<AppRoute path='resources/:resourceId' element={<ResourceDetailPage />} />
						<AppRoute path='actions' element={<ActionListPage />} />
						<AppRoute path='entitlements' element={<EntitlementListPage />} />
						<AppRoute path='roles' element={<RoleListPage />} />
						<AppRoute path='roles/:roleId' element={<RoleDetailPage />} />
						<AppRoute path='role-suites' element={<RoleSuiteListPage />} />
						<AppRoute path='grant-requests' element={<GrantRequestListPage />} />
						<AppRoute path='revoke-requests' element={<RevokeRequestListPage />} />
					</AppRoutes>
					<WidgetRoutes>
					</WidgetRoutes>
				</MicroAppRouter>
			</MantineProvider>
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
