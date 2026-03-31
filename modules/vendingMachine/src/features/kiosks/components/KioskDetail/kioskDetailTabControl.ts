import { createDetailTabControl } from '@/components/DetailLayout';

import type { KioskDetailTabId } from './hooks/types';


export const {
	DetailTabControlProvider: KioskDetailTabControlProvider,
	useDetailTabControl: useKioskDetailTabControl,
	useRegisterDetailTab: useRegisterKioskDetailTab,
} = createDetailTabControl<KioskDetailTabId>();
