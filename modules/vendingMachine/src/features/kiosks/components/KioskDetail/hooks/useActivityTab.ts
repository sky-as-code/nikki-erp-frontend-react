import { Kiosk } from '@/features/kiosks';

import type { TabHookReturn } from './types';

/**
 * Hook quản lý Activity tab
 */
export const useActivityTab = (_kiosk?: Kiosk): TabHookReturn => {
	return {
		actions: [],
		handlers: {},
		state: {},
	};
};
