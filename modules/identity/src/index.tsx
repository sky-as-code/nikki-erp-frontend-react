import { Alert, MantineProvider } from '@mantine/core';
import { MenuBarItem, useSetMenuBarItems } from '@nikkierp/ui/appState/layoutSlice';
import { initMicroAppStateContext, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import React from 'react';
import { Link, Navigate } from 'react-router';

import { reducer } from './appState';
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
	{
		label: 'Settings',
		link: `/settings`,
	},
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
					<AppRoute path='users/:userId' element={<UserDetailPage />} />
					{/* <AppRoute path='users' element={<UserListSplitDetail />} /> */}
				</AppRoutes>
				{/* <WidgetRoutes>
						<WidgetRoute name='org-home' Component={OrgHomePage} />
						<WidgetRoute name='module-management' Component={ModuleManagementPage} />
					</WidgetRoutes> */}
			</MicroAppRouter>
		</MicroAppProvider>
	);
}

function OverviewPage(): React.ReactNode {
	return (
		<>
			<Alert variant='filled' color='blue'><h1>Identity Module</h1></Alert>
			<Link to='user-detail'>User Detail</Link><br />
			<Link to='user-list'>User List</Link><br />
			<Link to='users'>User Split</Link><br />
		</>
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
