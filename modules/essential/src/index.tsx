import { Alert, MantineProvider } from '@mantine/core';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider,
	MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { AppStateProvider, initAppStateContext } from '@nikkierp/ui/stateManagement';
import React from 'react';
import { Link } from 'react-router';

import { ModuleManagementPage } from './pages/ModuleManagement';
import { OrgHomePage } from './pages/OrgHomePage';
import { reducer } from './state';


const Main: React.FC<MicroAppProps> = (props) => {
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
};

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
