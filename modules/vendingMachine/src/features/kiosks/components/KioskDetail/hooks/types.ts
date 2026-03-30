
import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { Kiosk } from '@/features/kiosks';


export type TabHookReturn<TabProps extends Record<string, any> = Record<string, any>> = {
	props: TabProps;
	actions: ControlPanelProps['actions'];
	handlers: Record<string, (...args: any[]) => void>;
};

export type TabId = 'basicInfo' | 'kioskSetting' | 'productsList' | 'productsGrid' | 'activity';

export type UseKioskDetailPageConfigProps = {
	kiosk?: Kiosk;
	activeTab: TabId;
	/** Mở modal xóa kiosk (Basic info tab — nút Delete) */
	onOpenDeleteKiosk?: (kiosk: Kiosk) => void;
};

export type UseKioskDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	tabs: DetailLayoutProps['tabs'];
};
