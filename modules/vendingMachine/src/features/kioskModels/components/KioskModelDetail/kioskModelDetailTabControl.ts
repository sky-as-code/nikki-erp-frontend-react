import { createDetailTabControl } from '@/components/DetailLayout';

import type { KioskModelDetailTabId } from './hooks/types';


export const {
	DetailTabControlProvider: KioskModelDetailTabControlProvider,
	useDetailTabControl: useKioskModelDetailTabControl,
	useRegisterDetailTab: useRegisterKioskModelDetailTab,
} = createDetailTabControl<KioskModelDetailTabId>();
