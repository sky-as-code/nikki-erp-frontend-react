import { MantineProvider } from '@mantine/core';
import { useSetMenuBarItems } from '@nikkierp/ui/appState';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext, useMicroAppDispatch,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { registerDriveFileSelectorWebComponent } from './features/files/components';
import { useMenuBarItems } from './hooks';
import { DriveLayout } from './layouts';
import { FolderPage } from './pages/file/FolderPage';
import { SharedWithMePage } from './pages/file/SharedFilePage';
import { StarredFilePage } from './pages/file/StaredFilePage';
import { TrashPage } from './pages/file/TrashPage';
import { DriveSearchPage } from './pages/file/DriveSearchPage';
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
						<AppRoute>
							<AppRoute index element={<Navigate to='management/my-files' replace />} />
							<AppRoute path='overview' element={<OverviewPage />} />
							<AppRoute path='management' element={<DriveLayout />}>
								<AppRoute index element={<Navigate to='my-files' replace />} />
								<AppRoute path='my-files' element={<FolderPage />} />
								<AppRoute path='trash' element={<TrashPage />} />
								<AppRoute path='search-result' element={<DriveSearchPage />} />
								<AppRoute path='shared-with-me' element={<SharedWithMePage />} />
								<AppRoute path='starred' element={<StarredFilePage />} />
								<AppRoute path='folder/:driveFileId' element={<FolderPage />} />
							</AppRoute>
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

		registerDriveFileSelectorWebComponent();

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);
		return {
			domType,
		};
	},
};

export default bundle;
