
import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { Kiosk } from '@/features/kiosks';

import type { KioskCreateFormData } from '@/features/kiosks/hooks/useKioskCreate';
import type { KioskSettingFormData } from '@/features/kiosks/kioskSettingForm';
import type { ModelSchema } from '@nikkierp/ui/model';


export type BasicInfoTabState = {
	isEditing: boolean;
	formId: string;
	modelSchema: ModelSchema;
	isSubmitting: boolean;
	onFormSubmit: (data: KioskCreateFormData) => void;
};

export type KioskSettingTabState = {
	isEditing: boolean;
	formId: string;
	modelSchema: ModelSchema;
	isSubmitting: boolean;
	onFormSubmit: (data: KioskSettingFormData) => void;
	/** Gắn hành vi reset form + state hiển thị khi Cancel (gọi từ KioskSetting). */
	registerResetForm: (fn: () => void) => void;
};

export type TabHookReturn<TabState extends Record<string, any> = Record<string, any>> = {
	state: TabState;
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
	tabs: DetailLayoutProps['tabs'];
	tabState: Record<string, any>;
	actions: ControlPanelProps['actions'];
	handlers: Record<string, (...args: any[]) => void>;
	getTabActions: (tabId: TabId) => ControlPanelProps['actions'];
	getTabHandlers: (tabId: TabId) => Record<string, (...args: any[]) => void>;
	getTabState: (tabId: TabId) => Record<string, any>;
};
