import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { Kiosk } from '@/features/kiosks';


export type TabHookReturn<TabState extends Record<string, any> = Record<string, any>> = {
	state: TabState;
	actions: ControlPanelProps['actions'];
	handlers: Record<string, (...args: any[]) => void>;
};

export type TabId = 'basicInfo' | 'kioskSetting' | 'productsList' | 'productsGrid' | 'activity';

export type UseKioskDetailTabsProps = {
	kiosk?: Kiosk;
	activeTab: TabId;
};

export type UseKioskDetailTabsReturn = {
	tabs: DetailLayoutProps['tabs'];
	tabState: Record<string, any>;
	actions: ControlPanelProps['actions'];
	handlers: Record<string, (...args: any[]) => void>;
	getTabActions: (tabId: TabId) => ControlPanelProps['actions'];
	getTabHandlers: (tabId: TabId) => Record<string, (...args: any[]) => void>;
	getTabState: (tabId: TabId) => Record<string, any>;
};
