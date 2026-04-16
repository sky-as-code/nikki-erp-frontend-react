import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';


export type KioskModelDetailTabId = 'basicInfo' | 'modelSettings';

export type UseKioskModelDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	tabs: DetailLayoutProps['tabs'];
	activeTab: KioskModelDetailTabId;
	onTabChange: (tab: KioskModelDetailTabId) => void;
};
