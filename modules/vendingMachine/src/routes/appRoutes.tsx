import { PermissionScopeType } from '@nikkierp/shell/userContext';
import { Navigate } from 'react-router';

import { VendingMachineLayout } from '@/layouts';
import { EventDetailPage } from '@/pages/events/EventDetailPage';
import { EventsPage } from '@/pages/events/EventsPage';
import { GameDetailPage } from '@/pages/games/GameDetailPage';
import { GamesPage } from '@/pages/games/GamesPage';
import { KioskDeviceDetailPage } from '@/pages/kioskDevices/KioskDeviceDetailPage';
import { KioskDevicePage } from '@/pages/kioskDevices/KioskDevicePage';
import { KioskModelCreatePage } from '@/pages/kioskModels/KioskModelCreatePage';
import { KioskModelDetailPage } from '@/pages/kioskModels/KioskModelDetailPage';
import { KioskModelPage } from '@/pages/kioskModels/KioskModelPage';
import { KioskCreatePage } from '@/pages/kiosks/KioskCreatePage';
import { KioskDetailPage } from '@/pages/kiosks/KioskDetailPage';
import { KioskListPage } from '@/pages/kiosks/KioskListPage';
import { KioskSettingCreatePage } from '@/pages/kioskSettings/KioskSettingCreatePage';
import { KioskSettingDetailPage } from '@/pages/kioskSettings/KioskSettingDetailPage';
import { KioskSettingPage } from '@/pages/kioskSettings/KioskSettingPage';
import OverviewPage from '@/pages/overview/OverviewPage';
import { PaymentCreatePage } from '@/pages/payment/PaymentCreatePage';
import { PaymentDetailPage } from '@/pages/payment/PaymentDetailPage';
import { PaymentListPage } from '@/pages/payment/PaymentListPage';
import { RevenueOverview } from '@/pages/reports/RevenueOverview';
import { SettingDetailPage } from '@/pages/settings/SettingDetailPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { SlideshowDetailPage } from '@/pages/slideshow/SlideshowDetailPage';
import { SlideshowsPage } from '@/pages/slideshow/SlideshowsPage';
import { ThemeDetailPage } from '@/pages/themes/ThemeDetailPage';
import { ThemesPage } from '@/pages/themes/ThemesPage';


export type AppRouteConfig = {
	key: string;
	path?: string; //* route path
	element?: React.ReactNode; //* route element
	index?: boolean;

	// * permission guard props
	contextScope?: { scopeType: PermissionScopeType; scopeRef: string };
	resource?: string;
	action?: string;

	// * children routes
	children?: AppRouteConfig[];
};

export const appRoutes: AppRouteConfig[] = [{
	key: 'wrapper',
	element: <VendingMachineLayout />,
	children: [
		{
			key: 'index',
			index: true,
			element: <Navigate to='overview' replace />,
		},
		{
			key: 'overview',
			path: 'overview',
			element: <OverviewPage />,
		},
		{
			key: 'kiosks',
			path: 'kiosks',
			element: <KioskListPage />,
		},
		{
			key: 'kiosks-create',
			path: 'kiosks/create',
			element: <KioskCreatePage />,
		},
		{
			key: 'kiosks-detail',
			path: 'kiosks/:id',
			element: <KioskDetailPage />,
		},
		{
			key: 'kiosk-models',
			path: 'kiosk-models',
			element: <KioskModelPage />,
		},
		{
			key: 'kiosk-models-create',
			path: 'kiosk-models/create',
			element: <KioskModelCreatePage />,
		},
		{
			key: 'kiosk-models-detail',
			path: 'kiosk-models/:id',
			element: <KioskModelDetailPage />,
		},
		{
			key: 'kiosk-settings',
			path: 'kiosk-settings',
			element: <KioskSettingPage />,
		},
		{
			key: 'kiosk-settings-create',
			path: 'kiosk-settings/create',
			element: <KioskSettingCreatePage />,
		},
		{
			key: 'kiosk-settings-detail',
			path: 'kiosk-settings/:id',
			element: <KioskSettingDetailPage />,
		},
		{
			key: 'kiosk-devices',
			path: 'kiosk-devices',
			element: <KioskDevicePage />,
		},
		{
			key: 'kiosk-devices-detail',
			path: 'kiosk-devices/:id',
			element: <KioskDeviceDetailPage />,
		},
		{
			key: 'settings',
			path: 'settings',
			element: <SettingsPage />,
		},
		{
			key: 'settings-detail',
			path: 'settings/:id',
			element: <SettingDetailPage />,
		},
		{
			key: 'slideshows-gallery',
			path: 'slideshows/gallery',
			element: <></>,
		},
		{
			key: 'slideshow',
			path: 'slideshow/playlists',
			element: <SlideshowsPage />,
		},
		{
			key: 'slideshow-detail',
			path: 'slideshow/:id',
			element: <SlideshowDetailPage />,
		},
		{
			key: 'themes',
			path: 'themes',
			element: <ThemesPage />,
		},
		{
			key: 'themes-detail',
			path: 'themes/:id',
			element: <ThemeDetailPage />,
		},
		{
			key: 'games',
			path: 'games',
			element: <GamesPage />,
		},
		{
			key: 'games-detail',
			path: 'games/:id',
			element: <GameDetailPage />,
		},
		{
			key: 'events',
			path: 'events',
			element: <EventsPage />,
		},
		{
			key: 'events-detail',
			path: 'events/:id',
			element: <EventDetailPage />,
		},
		{
			key: 'payment',
			path: 'payment',
			element: <PaymentListPage />,
		},
		{
			key: 'payment-create',
			path: 'payment/create',
			element: <PaymentCreatePage />,
		},
		{
			key: 'payment-detail',
			path: 'payment/:id',
			element: <PaymentDetailPage />,
		},
		{
			key: 'reports-business-overview',
			path: 'reports/business-overview',
			element: <RevenueOverview />,
		},
		{
			key: 'reports-revenue',
			path: 'reports/revenue',
			element: <></>,
		},
		{
			key: 'reports-pnl',
			path: 'reports/pnl',
			element: <></>,
		},
		{
			key: 'reports-refunds',
			path: 'reports/refunds',
			element: <></>,
		},
		{
			key: 'reports-orders',
			path: 'reports/orders',
			element: <></>,
		},
		{
			key: 'reports-operations-overview',
			path: 'reports/operations-overview',
			element: <></>,
		},
		{
			key: 'reports-inventory',
			path: 'reports/inventory',
			element: <></>,
		},
	],
}];
