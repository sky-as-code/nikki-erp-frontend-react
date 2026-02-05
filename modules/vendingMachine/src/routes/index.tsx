import { AppRoute } from '@nikkierp/ui/microApp';
import React from 'react';
import { Navigate } from 'react-router';


import { VendingMachineLayout } from '../layouts';
import { AdDetailPage } from '../pages/ads/AdDetailPage';
import { AdsPage } from '../pages/ads/AdsPage';
import { EventDetailPage } from '../pages/events/EventDetailPage';
import { EventsPage } from '../pages/events/EventsPage';
import { GameDetailPage } from '../pages/games/GameDetailPage';
import { GamesPage } from '../pages/games/GamesPage';
import { KioskDeviceDetailPage } from '../pages/kioskDevices/KioskDeviceDetailPage';
import { KioskDevicePage } from '../pages/kioskDevices/KioskDevicePage';
import { KioskDetailPage } from '../pages/kiosks/KioskDetailPage';
import { KioskListPage } from '../pages/kiosks/KioskListPage';
import { KioskSettingDetailPage } from '../pages/kioskSettings/KioskSettingDetailPage';
import { KioskSettingsPage } from '../pages/kioskSettings/KioskSettingsPage';
import { KioskTemplateDetailPage } from '../pages/kioskTemplate/KioskTemplateDetailPage';
import { KioskTemplatePage } from '../pages/kioskTemplate/KioskTemplatePage';
import { OverviewPage } from '../pages/overview/OverviewPage';
import { PaymentDetailPage } from '../pages/payment/PaymentDetailPage';
import { PaymentPage } from '../pages/payment/PaymentPage';
import { ThemeDetailPage } from '../pages/themes/ThemeDetailPage';
import { ThemesPage } from '../pages/themes/ThemesPage';



export const AppRouteElements: React.ReactNode = (
	<AppRoute element={<VendingMachineLayout />}>
		<AppRoute index element={<Navigate to='overview' replace />} />
		<AppRoute path='overview' element={<OverviewPage />} />
		<AppRoute path='kiosks' element={<KioskListPage />} />
		<AppRoute path='kiosks/:id' element={<KioskDetailPage />} />
		<AppRoute path='ads' element={<AdsPage />} />
		<AppRoute path='ads/:id' element={<AdDetailPage />} />
		<AppRoute path='events' element={<EventsPage />} />
		<AppRoute path='events/:id' element={<EventDetailPage />} />
		<AppRoute path='kiosk-settings' element={<KioskSettingsPage />} />
		<AppRoute path='kiosk-settings/:id' element={<KioskSettingDetailPage />} />
		<AppRoute path='kiosk-template' element={<KioskTemplatePage />} />
		<AppRoute path='kiosk-template/:id' element={<KioskTemplateDetailPage />} />
		<AppRoute path='kiosk-devices' element={<KioskDevicePage />} />
		<AppRoute path='kiosk-devices/:id' element={<KioskDeviceDetailPage />} />
		<AppRoute path='payment' element={<PaymentPage />} />
		<AppRoute path='payment/:id' element={<PaymentDetailPage />} />
		<AppRoute path='themes' element={<ThemesPage />} />
		<AppRoute path='themes/:id' element={<ThemeDetailPage />} />
		<AppRoute path='mini-game' element={<GamesPage />} />
		<AppRoute path='mini-game/:id' element={<GameDetailPage />} />
	</AppRoute>
);

export const WidgetRouteElements: React.ReactNode = (
	<>
		{/* Add widget routes here */}
	</>
);
