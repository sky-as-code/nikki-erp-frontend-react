import { Alert, MantineProvider } from '@mantine/core';
import { defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps, MicroAppRoutes } from '@nikkierp/ui/microApp';
import { AppStateProvider } from '@nikkierp/ui/stateManagement';
import React from 'react';
import { Link, Route } from 'react-router';

import { ModuleManagementPage } from './pages/ModuleManagement';
import { OrgHomePage } from './pages/OrgHomePage';
import { reducer } from './state';


const Main: React.FC<MicroAppProps> = ({ stateMgmt, basePath, widgetPath }) => {
	const result = stateMgmt.registerReducer(reducer);

	return (
		<AppStateProvider registerResult={result}>
			{/* <MantineProvider> */}
			<Alert variant='filled' color='blue'><h1>Essential Module</h1></Alert>
			{/* <MicroAppRoutes basePath={basePath} widgetPath={widgetPath}>
					<Route index element={<>
						<Link to='/org-home'>Org Home</Link><br />
						<Link to='/module-management'>Module Management</Link>
					</>} />
					<Route path='/org-home' element={<OrgHomePage />} />
					<Route path='/module-management' element={<ModuleManagementPage />} />
				</MicroAppRoutes>
			</MantineProvider> */}
		</AppStateProvider>
	);
};

const initBundle: MicroAppBundle = ({ htmlTag }) => {
	const domType = MicroAppDomType.SHARED;
	defineWebComponent(Main, {
		htmlTag,
		domType,
	});
	return {
		domType,
	};
};

export default initBundle;
