import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { PageContainerProps } from '@/components/PageContainer';

import { KioskSetting } from '../../../types';


export type KioskSettingDetailTabId = 'basicInfo' | 'settings' | 'kiosks';

export type KioskSettingUpdatePayload = Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>>;

export type UseKioskSettingDetailPageConfigProps = {
	setting?: KioskSetting;
};

export type UseKioskSettingDetailPageConfigReturn = {
	breadcrumbs: NonNullable<PageContainerProps['breadcrumbs']>;
	actions: ControlPanelProps['actions'];
	tabs: DetailLayoutProps['tabs'];
	activeTab: KioskSettingDetailTabId;
	onTabChange: (tab: string) => void;
};
