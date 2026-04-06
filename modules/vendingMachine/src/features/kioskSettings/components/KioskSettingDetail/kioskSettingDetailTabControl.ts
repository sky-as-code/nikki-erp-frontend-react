import { createDetailTabControl } from '@/components/DetailLayout';

import type { KioskSettingDetailTabId } from './hooks/types';


export const {
	DetailTabControlProvider: KioskSettingDetailTabControlProvider,
	useDetailTabControl: useKioskSettingDetailTabControl,
	useRegisterDetailTab: useRegisterKioskSettingDetailTab,
} = createDetailTabControl<KioskSettingDetailTabId>();
