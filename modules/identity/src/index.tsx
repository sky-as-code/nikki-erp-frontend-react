import { Alert, MantineProvider } from '@mantine/core';
import { initMicroAppStateContext } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import React from 'react';
import { Link } from 'react-router';

import { reducer } from './appState';
import { UserDetailPage } from './pages/UserDetailPage';
import { UserListPage } from './pages/UserListPage';
import { UserListSplitDetail } from './pages/UserListSplitDetail';


const Main: React.FC<MicroAppProps> = (props) => {
	// const result = props.registerReducer(reducer);

	return (
		<MicroAppProvider {...props}>
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
							<Link to='users'>User Split</Link><br />
						</>} />
						<AppRoute path='users' element={<UserListPage />} />
						<AppRoute path='users/:userId' element={<UserDetailPage />} />
						{/* <AppRoute path='users' element={<UserListSplitDetail />} /> */}
					</AppRoutes>
					{/* <WidgetRoutes>
						<WidgetRoute name='org-home' Component={OrgHomePage} />
						<WidgetRoute name='module-management' Component={ModuleManagementPage} />
					</WidgetRoutes> */}
				</MicroAppRouter>
			</MantineProvider>
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
		initMicroAppStateContext(result);
		return {
			domType,
		};
	},
};

export default bundle;
