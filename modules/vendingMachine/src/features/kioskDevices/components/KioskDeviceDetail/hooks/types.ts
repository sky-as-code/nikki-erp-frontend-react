import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { KioskDevice } from '@/features/kioskDevices/types';


export type KioskDeviceDetailTabId = 'basicInfo' | 'specifications';

export type UseKioskDeviceDetailPageConfigProps = {
	kioskDevice?: KioskDevice;
};

export type UseKioskDeviceDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	tabs: DetailLayoutProps['tabs'];
	activeTab: KioskDeviceDetailTabId;
	onTabChange: (tab: KioskDeviceDetailTabId) => void;
};
