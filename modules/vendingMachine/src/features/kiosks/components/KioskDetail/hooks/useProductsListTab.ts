import { Kiosk } from '@/features/kiosks';

import type { TabHookReturn } from './types';

/**
 * Hook quản lý ProductsList tab
 */
export const useProductsListTab = (_kiosk?: Kiosk): TabHookReturn => {
	return {
		actions: [],
		handlers: {},
		state: {},
	};
};
