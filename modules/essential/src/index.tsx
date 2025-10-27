import { Alert, MantineProvider } from '@mantine/core';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { AppStateProvider } from '@nikkierp/ui/stateManagement';
import React from 'react';
import { Link } from 'react-router';

import { ModuleManagementPage } from './pages/ModuleManagement';
import { OrgHomePage } from './pages/OrgHomePage';
import { reducer } from './state';


const Main: React.FC<MicroAppProps> = (props) => {
	const result = props.stateMgmt.registerReducer(reducer);

	return (
		<AppStateProvider registerResult={result}>
			<MantineProvider>
				<Alert variant='filled' color='blue'><h1>Essential Module</h1></Alert>
				<MicroAppRouter domType={props.domType} basePath={props.basePath} widgetName={props.widgetName}>
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
	);
};

const initBundle: MicroAppBundle = ({ htmlTag }) => {
	const domType = MicroAppDomType.ISOLATED;
	defineWebComponent(Main, {
		htmlTag,
		domType,
	});
	return {
		domType,
	};
};

export default initBundle;
