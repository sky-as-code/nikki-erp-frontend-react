
import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { Kiosk } from '@/features/kiosks';


export type KioskDetailTabId = 'basicInfo' | 'kioskSetting' | 'productsList' | 'productsGrid' | 'activity';

export type UseKioskDetailPageConfigProps = {
	kiosk?: Kiosk;
};

export type UseKioskDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	tabs: DetailLayoutProps['tabs'];
	activeTab: KioskDetailTabId;
	onTabChange: (tab: KioskDetailTabId) => void;
};
