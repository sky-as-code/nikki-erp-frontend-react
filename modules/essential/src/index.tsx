import { Alert, MantineProvider } from '@mantine/core';
import { MenuBarItem, useSetMenuBarItems } from '@nikkierp/ui/appState';
import { AuthorizedGuard } from '@nikkierp/ui/components';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext, useMicroAppDispatch,
	MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import React from 'react';
import { Link } from 'react-router';

import { reducer } from './appState';
import { ModuleManagementPage } from './pages/ModuleManagement';
import { OrgHomePage } from './pages/OrgHomePage';


const menuBarItems: MenuBarItem[] = [
	{
		label: 'Home',
		items: [
			{
				label: 'Org Home',
				link: `/org-home/sub`,
			},
		],
	},
	{
		label: 'Management',
		items: [
			{
				label: 'Management lvl 2.1',
				items: [
					{
						label: 'Management lvl 3',
						link: `/module-management`,
						items: [
							{
								label: 'Management lvl 4',
								link: `/module-management`,
								items: [
									{
										label: 'Org Home Sub',
										link: `/org-home`,
									},
								],
							},
						],
					},
				],
			},
			{
				label: 'Management lvl 2.2',
				items: [
					{
						label: 'Management lvl 2.2.1',
						items: [
							{
								label: 'Org Home Sub',
								link: `/module-management`,
							},
						],
					},
				],
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
				<Alert variant='filled' color='blue'><h1>Essential Module</h1></Alert>
				<MicroAppRouter domType={props.domType} basePath={props.routing.basePath}
					widgetName={props.widgetName}
					widgetProps={props.widgetProps}
				>
					<AppRoutes>
						<AppRoute index element={<>
							<Link to='authorized'>Authorized</Link><br />
							<Link to='org-home'>Org Home</Link><br />
							<Link to='module-management'>Module Management</Link>
						</>} />
						<AppRoute path='authorized' element={<AuthorizedPage />} />
						<AppRoute path='org-home' element={<OrgHomePage />} />
						<AppRoute path='module-management' element={<ModuleManagementPage />} />
					</AppRoutes>
					<WidgetRoutes>
						<WidgetRoute name='org-home' Component={OrgHomePage} />
						<WidgetRoute name='module-management' Component={ModuleManagementPage} />
					</WidgetRoutes>
				</MicroAppRouter>
			</MantineProvider>
		</MicroAppProvider>
	);
}

function AuthorizedPage(): React.ReactNode {
	return (
		<AuthorizedGuard>
			<p>Essential Authorized Page</p>
			<Link to='/'>Back to Shell</Link>
		</AuthorizedGuard>
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
