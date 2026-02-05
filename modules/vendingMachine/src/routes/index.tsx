import { AppRoute } from '@nikkierp/ui/microApp';
import React from 'react';
import { Navigate } from 'react-router';


import { VendingMachineLayout } from '../layouts';
import { AdsPage } from '../pages/ads/AdsPage';
import { EventsPage } from '../pages/events/EventsPage';
import { GamesPage } from '../pages/games/GamesPage';
import { KioskDevicePage } from '../pages/kioskDevices/KioskDevicePage';
import { KioskListPage } from '../pages/kiosks/KioskListPage';
import { KioskSettingsPage } from '../pages/kioskSettings/KioskSettingsPage';
import { KioskTemplatePage } from '../pages/kioskTemplate/KioskTemplatePage';
import { OverviewPage } from '../pages/overview/OverviewPage';
import { PaymentPage } from '../pages/payment/PaymentPage';
import { ThemesPage } from '../pages/themes/ThemesPage';



export const AppRouteElements: React.ReactNode = (
	<AppRoute element={<VendingMachineLayout />}>
		<AppRoute index element={<Navigate to='overview' replace />} />
		<AppRoute path='overview' element={<OverviewPage />} />
		<AppRoute path='kiosks' element={<KioskListPage />} />
		<AppRoute path='ads' element={<AdsPage />} />
		<AppRoute path='events' element={<EventsPage />} />
		<AppRoute path='kiosk-settings' element={<KioskSettingsPage />} />
		<AppRoute path='kiosk-template' element={<KioskTemplatePage />} />
		<AppRoute path='kiosk-devices' element={<KioskDevicePage />} />
		<AppRoute path='payment' element={<PaymentPage />} />
		<AppRoute path='themes' element={<ThemesPage />} />
		<AppRoute path='mini-game' element={<GamesPage />} />
	</AppRoute>
);

export const WidgetRouteElements: React.ReactNode = (
	<>
		{/* Add widget routes here */}
	</>
);
