import { Alert, MantineProvider } from '@mantine/core';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider,
	MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { AppStateProvider } from '@nikkierp/ui/stateManagement';
import React from 'react';
import { Link } from 'react-router';

import { UserDetailPage } from './pages/UserDetailPage';
import { UserListPage } from './pages/UserListPage';


const Main: React.FC<MicroAppProps> = (props) => {
	// const result = props.registerReducer(reducer);

	return (
		<MicroAppProvider {...props}>
			{/* <AppStateProvider registerResult={result}> */}
			<MantineProvider>
				<Alert variant='filled' color='blue'><h1>Identity Module</h1></Alert>
				<MicroAppRouter domType={props.domType} basePath={props.routing.basePath}
					widgetName={props.widgetName}
					widgetProps={props.widgetProps}
				>
					<AppRoutes>
						<AppRoute index element={<>
							<Link to='user-detail'>User Detail</Link><br />
							<Link to='user-list'>User List</Link><br />
						</>} />
						<AppRoute path='user-detail' element={<UserDetailPage />} />
						<AppRoute path='user-list' element={<UserListPage />} />
					</AppRoutes>
					{/* <WidgetRoutes>
						<WidgetRoute name='org-home' Component={OrgHomePage} />
						<WidgetRoute name='module-management' Component={ModuleManagementPage} />
					</WidgetRoutes> */}
				</MicroAppRouter>
			</MantineProvider>
			{/* </AppStateProvider> */}
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

		// const result = registerReducer(reducer);
		// initAppStateContext(result);
		return {
			domType,
		};
	},
};

export default bundle;
