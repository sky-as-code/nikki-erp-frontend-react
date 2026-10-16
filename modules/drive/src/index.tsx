import { MenuIndexRedirect } from '@nikkierp/ui/menu';
import {
	AppRoute, AppRoutes, defineWebComponent, MicroAppBundle, MicroAppDomType, MicroAppProps,
	MicroAppProvider, initMicroAppStateContext,
	MicroAppRouter, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { SyncedMantineProvider } from '@nikkierp/ui/theme';
import { Navigate } from 'react-router';

import { reducer } from './appState';
import { DRIVE_TABS } from './constants/driveTabs';
import { registerDriveFileSelectorWebComponent } from './features/files/components';
import { DriveLayout } from './layouts';
import { buildDriveMenu } from './menu';
import { DriveSearchPage } from './pages/file/DriveSearchPage';
import { FolderPage } from './pages/file/FolderPage';
import { SharedWithMePage } from './pages/file/SharedFilePage';
import { StarredFilePage } from './pages/file/StaredFilePage';
import { TrashPage } from './pages/file/TrashPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import './styles/index.css';


function Main(props: MicroAppProps) {
	return (
		<MicroAppProvider {...props}>
			<SyncedMantineProvider>
				<MicroAppRouter
					domType={props.domType}
					basePath={props.routing.basePath}
					widgetName={props.widgetName}
					widgetProps={props.widgetProps}
				>
					<AppRoutes>
						<AppRoute>
							<AppRoute index element={<MenuIndexRedirect items={buildDriveMenu(props.slug).items} />} />
							<AppRoute path='overview' element={<OverviewPage />} />
							<AppRoute path='management' element={<DriveLayout />}>
								<AppRoute index element={<Navigate to={DRIVE_TABS.MY_FILES} replace />} />
								<AppRoute path={DRIVE_TABS.MY_FILES} element={<FolderPage />} />
								<AppRoute path={DRIVE_TABS.TRASH} element={<TrashPage />} />
								<AppRoute path='search-result' element={<DriveSearchPage />} />
								<AppRoute path={DRIVE_TABS.SHARED_WITH_ME} element={<SharedWithMePage />} />
								<AppRoute path={DRIVE_TABS.STARRED} element={<StarredFilePage />} />
								<AppRoute path='folder/:driveFileId' element={<FolderPage />} />
							</AppRoute>
						</AppRoute>
					</AppRoutes>
					<WidgetRoutes />
				</MicroAppRouter>
			</SyncedMantineProvider>
		</MicroAppProvider>
	);
}

const bundle: MicroAppBundle = {
	init({ htmlTag, slug, registerReducer, host }) {
		const domType = MicroAppDomType.SHARED;
		defineWebComponent(Main, {
			htmlTag,
			domType,
		});

		registerDriveFileSelectorWebComponent();

		const result = registerReducer(reducer);
		initMicroAppStateContext(result);
		host.menuRegistry.register(buildDriveMenu(slug));
		return {
			domType,
		};
	},
};

export default bundle;
