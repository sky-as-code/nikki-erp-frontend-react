import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { KioskModel } from '@/features/kioskModels/types';


export type KioskModelDetailTabId = 'basicInfo' | 'modelSettings';

export type UseKioskModelDetailPageConfigProps = {
	model?: KioskModel;
};

export type UseKioskModelDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	tabs: DetailLayoutProps['tabs'];
	activeTab: KioskModelDetailTabId;
	onTabChange: (tab: KioskModelDetailTabId) => void;
};
