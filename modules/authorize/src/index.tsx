import { MantineProvider } from '@mantine/core';
import { MenuBarItem, useSetMenuBarItems } from '@nikkierp/ui/appState';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext, useMicroAppDispatch,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { ActionListPage } from './pages/actions/ActionListPage';
import { EntitlementListPage } from './pages/entitlements/EntitlementListPage';
import { GrantRequestListPage } from './pages/grantRequest/GrantRequestListPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { ResourceCreatePage } from './pages/resources/ResourceCreatePage';
import { ResourceDetailPage } from './pages/resources/ResourceDetailPage';
import { ResourceListPage } from './pages/resources/ResourceListPage';
import { RevokeRequestListPage } from './pages/revokeRequest/RevokeRequestListPage';
import { RoleDetailPage } from './pages/role/RoleDetailPage';
import { RoleListPage } from './pages/role/RoleListPage';
import { RoleSuiteListPage } from './pages/role_suite/RoleSuiteListPage';


function useMenuBarItems(): MenuBarItem[] {
	const { t: translate } = useTranslation();
	return [
	{
			label: translate('nikki.authorize.menu.overview'),
		link: '/overview',
	},
	{
			label: translate('nikki.authorize.menu.resources_actions'),
		items: [
			{
					label: translate('nikki.authorize.menu.resources'),
				link: '/resources',
			},
			{
					label: translate('nikki.authorize.menu.actions'),
				link: '/actions',
			},
			{
					label: translate('nikki.authorize.menu.entitlements'),
				link: '/entitlements',
			},
		],
	},
	{
			label: translate('nikki.authorize.menu.roles'),
		items: [
			{
					label: translate('nikki.authorize.menu.roles'),
				link: '/roles',
			},
			{
					label: translate('nikki.authorize.menu.role_suites'),
				link: '/role-suites',
			},
		],
	},
	{
			label: translate('nikki.authorize.menu.requests'),
		items: [
			{
					label: translate('nikki.authorize.menu.grant_requests'),
				link: '/grant-requests',
			},
			{
					label: translate('nikki.authorize.menu.revoke_requests'),
				link: '/revoke-requests',
			},
		],
	},
];
}

function Main(props: MicroAppProps) {
	const dispatch = useMicroAppDispatch();
	const menuBarItems = useMenuBarItems();
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
						<AppRoute path='resources/create' element={<ResourceCreatePage />} />
						<AppRoute path='resources/:resourceName' element={<ResourceDetailPage />} />
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
