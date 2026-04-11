import type { KioskDetailTabId } from './hooks/types';

import { createDetailTabControl } from '@/components/DetailLayout';



export const {
	DetailTabControlProvider: KioskDetailTabControlProvider,
	useDetailTabControl: useKioskDetailTabControl,
	useRegisterDetailTab: useRegisterKioskDetailTab,
} = createDetailTabControl<KioskDetailTabId>();
