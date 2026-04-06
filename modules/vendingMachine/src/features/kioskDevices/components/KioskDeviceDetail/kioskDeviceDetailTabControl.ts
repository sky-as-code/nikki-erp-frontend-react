import { createDetailTabControl } from '@/components/DetailLayout';

import type { KioskDeviceDetailTabId } from './hooks/types';


export const {
	DetailTabControlProvider: KioskDeviceDetailTabControlProvider,
	useDetailTabControl: useKioskDeviceDetailTabControl,
	useRegisterDetailTab: useRegisterKioskDeviceDetailTab,
} = createDetailTabControl<KioskDeviceDetailTabId>();
