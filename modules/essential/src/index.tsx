import { Alert, MantineProvider } from '@mantine/core';
import { actions as layoutActions, MenuBarItem } from '@nikkierp/ui/layout';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider,
	MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { AppStateProvider, initAppStateContext, useMicroAppDispatch } from '@nikkierp/ui/stateManagement';
import React from 'react';
import { Link } from 'react-router';

import { reducer } from './appState';
import { ModuleManagementPage } from './pages/ModuleManagement';
import { OrgHomePage } from './pages/OrgHomePage';


function createMenuBarItems(basePath: string): MenuBarItem[] {
	return [
		{
			label: 'Home',
			items: [
				{
					label: 'Org Home',
					link: `${basePath}/org-home/sub`,
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
							link: `${basePath}/module-management`,
							items: [
								{
									label: 'Management lvl 4',
									link: `${basePath}/module-management`,
									items: [
										{
											label: 'Org Home Sub',
											link: `${basePath}/org-home`,
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
									link: `${basePath}/module-management`,
								},
							],
						},
					],
				},
			],
		},
	];
}

function Main(props: MicroAppProps) {
	const dispatch = useMicroAppDispatch();

	const menuBarItems = React.useMemo(
		() => createMenuBarItems(props.routing.basePath || ''),
		[props.routing.basePath],
	);

	React.useEffect(() => {
		dispatch(layoutActions.setMenuBarItems(menuBarItems));
	}, [menuBarItems]);

	return (
		<MicroAppProvider {...props}>
			<AppStateProvider>
				<MantineProvider>
					<Alert variant='filled' color='blue'><h1>Essential Module</h1></Alert>
					<MicroAppRouter domType={props.domType} basePath={props.routing.basePath}
						widgetName={props.widgetName}
						widgetProps={props.widgetProps}
					>
						<AppRoutes>
							<AppRoute index element={<>
								<Link to='org-home'>Org Home</Link><br />
								<Link to='module-management'>Module Management</Link>
							</>} />
							<AppRoute path='org-home' element={<OrgHomePage />} />
							<AppRoute path='module-management' element={<ModuleManagementPage />} />
						</AppRoutes>
						<WidgetRoutes>
							<WidgetRoute name='org-home' Component={OrgHomePage} />
							<WidgetRoute name='module-management' Component={ModuleManagementPage} />
						</WidgetRoutes>
					</MicroAppRouter>
				</MantineProvider>
			</AppStateProvider>
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
		initAppStateContext(result);
		return {
			domType,
		};
	},
};

export default bundle;
