import { AppRoute } from '@nikkierp/ui/microApp';
import React from 'react';
import { Navigate } from 'react-router';

import { VendingMachineLayout } from '../layout';
import { AdsPage } from '../pages/ads/AdsPage';
import { EventsPage } from '../pages/events/EventsPage';
import { KioskListPage } from '../pages/kiosks/KioskListPage';
import { KioskSettingsPage } from '../pages/kioskSettings/KioskSettingsPage';
import { KioskTemplatePage } from '../pages/kioskTemplate/KioskTemplatePage';
import { OverviewPage } from '../pages/overview/OverviewPage';


export const AppRouteElements: React.ReactNode = (
	<AppRoute element={<VendingMachineLayout />}>
		<AppRoute index element={<Navigate to='overview' replace />} />
		<AppRoute path='overview' element={<OverviewPage />} />
		<AppRoute path='kiosks' element={<KioskListPage />} />
		<AppRoute path='ads' element={<AdsPage />} />
		<AppRoute path='events' element={<EventsPage />} />
		<AppRoute path='kiosk-settings' element={<KioskSettingsPage />} />
		<AppRoute path='kiosk-template' element={<KioskTemplatePage />} />
	</AppRoute>
);

export const WidgetRouteElements: React.ReactNode = (
	<>
		{/* Add widget routes here */}
	</>
);
