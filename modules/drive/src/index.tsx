import { MantineProvider } from '@mantine/core';
import { useSetMenuBarItems } from '@nikkierp/ui/appState';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext, useMicroAppDispatch,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { useMenuBarItems } from './hooks';
import { DriveLayout } from './layouts';
import { FolderPage } from './pages/folder/FolderPage';
import { OverviewPage } from './pages/overview/OverviewPage';


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
						<AppRoute element={<DriveLayout />}>
							<AppRoute index element={<Navigate to='overview' replace />} />
							<AppRoute path='overview' element={<OverviewPage />} />
							<AppRoute path='folder/:driveFileId' element={<FolderPage />} />
						</AppRoute>
					</AppRoutes>
					<WidgetRoutes />
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
