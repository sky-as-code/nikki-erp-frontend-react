import { AppRoute } from '@nikkierp/ui/microApp';
import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router';

import { VendingMachineLayout } from '../layouts';
import { SlideshowDetailPage } from '../pages/slideshow/SlideshowDetailPage';
import { SlideshowsPage } from '../pages/slideshow/SlideshowsPage';
import { EventDetailPage } from '../pages/events/EventDetailPage';
import { EventsPage } from '../pages/events/EventsPage';
import { GameDetailPage } from '../pages/games/GameDetailPage';
import { GamesPage } from '../pages/games/GamesPage';
import { KioskDeviceDetailPage } from '../pages/kioskDevices/KioskDeviceDetailPage';
import { KioskDevicePage } from '../pages/kioskDevices/KioskDevicePage';
import { KioskModelCreatePage } from '../pages/kioskModels/KioskModelCreatePage';
import { KioskModelDetailPage } from '../pages/kioskModels/KioskModelDetailPage';
import { KioskModelPage } from '../pages/kioskModels/KioskModelPage';
import { KioskCreatePage } from '../pages/kiosks/KioskCreatePage';
import { KioskDetailPage } from '../pages/kiosks/KioskDetailPage';
import { KioskListPage } from '../pages/kiosks/KioskListPage';
import { KioskSettingDetailPage } from '../pages/kioskSettings/KioskSettingDetailPage';
import { KioskSettingPage } from '../pages/kioskSettings/KioskSettingPage';
import { OverviewPageSkeleton } from '../pages/overview/OverviewPageSkeleton';
import { PaymentDetailPage } from '../pages/payment/PaymentDetailPage';
import { PaymentPage } from '../pages/payment/PaymentPage';
import { RevenueOverview } from '../pages/reports/RevenueOverview';
import { SettingDetailPage } from '../pages/settings/SettingDetailPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { ThemeDetailPage } from '../pages/themes/ThemeDetailPage';
import { ThemesPage } from '../pages/themes/ThemesPage';



const OverviewPage = lazy(() => import('../pages/overview/OverviewPage'));

export const AppRouteElements: React.ReactNode = (
	<AppRoute element={<VendingMachineLayout />}>
		<AppRoute index element={<Navigate to='overview' replace />} />
		<AppRoute path='overview' element={<Suspense fallback={<OverviewPageSkeleton />}><OverviewPage /></Suspense>} />

		<AppRoute path='kiosks' element={<KioskListPage />} />
		<AppRoute path='kiosks/create' element={<KioskCreatePage />} />
		<AppRoute path='kiosks/:id' element={<KioskDetailPage />} />
		<AppRoute path='kiosk-model' element={<KioskModelPage />} />
		<AppRoute path='kiosk-model/create' element={<KioskModelCreatePage />} />
		<AppRoute path='kiosk-model/:id' element={<KioskModelDetailPage />} />
		<AppRoute path='kiosk-settings' element={<KioskSettingPage />} />
		<AppRoute path='kiosk-settings/:id' element={<KioskSettingDetailPage />} />
		<AppRoute path='kiosk-devices' element={<KioskDevicePage />} />
		<AppRoute path='kiosk-devices/:id' element={<KioskDeviceDetailPage />} />
		<AppRoute path='settings' element={<SettingsPage />} />
		<AppRoute path='settings/:id' element={<SettingDetailPage />} />

		<AppRoute path='presentation/gallery' element={<></>} />
		<AppRoute path='presentation/playlists' element={<SlideshowsPage />} />
		<AppRoute path='presentation/playlists/:id' element={<SlideshowDetailPage />} />
		<AppRoute path='themes' element={<ThemesPage />} />
		<AppRoute path='themes/:id' element={<ThemeDetailPage />} />
		<AppRoute path='mini-game' element={<GamesPage />} />
		<AppRoute path='mini-game/:id' element={<GameDetailPage />} />
		<AppRoute path='events' element={<EventsPage />} />
		<AppRoute path='events/:id' element={<EventDetailPage />} />

		<AppRoute path='payment' element={<PaymentPage />} />
		<AppRoute path='payment/:id' element={<PaymentDetailPage />} />

		<AppRoute path='reports/business-overview' element={<RevenueOverview />} />
		<AppRoute path='reports/revenue' element={<></>} />
		<AppRoute path='reports/pnl' element={<></>} />
		<AppRoute path='reports/refunds' element={<></>} />
		<AppRoute path='reports/orders' element={<></>} />
		<AppRoute path='reports/operations-overview' element={<></>} />
		<AppRoute path='reports/inventory' element={<></>} />
	</AppRoute>
);

export const WidgetRouteElements: React.ReactNode = (
	<>
		{/* Add widget routes here */}
	</>
);
