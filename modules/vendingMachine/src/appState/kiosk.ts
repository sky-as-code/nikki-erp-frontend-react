import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listKiosks,
	getKiosk,
	createKiosk,
	updateKiosk,
	deleteKiosk,
	KioskState,
	initialKioskState,
	DEFAULT_PAGE_SIZE,
	ListParams,
	searchKioskLogs,
} from '@/features/kiosks/kioskSlice';


export { DEFAULT_PAGE_SIZE as KIOSK_DEFAULT_PAGE_SIZE };
export type { ListParams };


const STATE_KEY = 'kiosk';

export const kioskReducer = {
	[STATE_KEY]: reducer,
};

export const kioskActions = {
	listKiosks,
	getKiosk,
	createKiosk,
	updateKiosk,
	deleteKiosk,
	searchKioskLogs,
	...actions,
};

export const selectKioskState = (state: { [STATE_KEY]?: KioskState }) => state?.[STATE_KEY] ?? initialKioskState;

export const selectKioskList = createSelector(
	selectKioskState,
	(state) => state.list,
);

export const selectKioskDetail = createSelector(
	selectKioskState,
	(state) => state.detail,
);

export const selectCreateKiosk = createSelector(
	selectKioskState,
	(state) => state.create,
);

export const selectUpdateKiosk = createSelector(
	selectKioskState,
	(state) => state.update,
);

export const selectDeleteKiosk = createSelector(
	selectKioskState,
	(state) => state.delete,
);

export const selectKioskListPagination = createSelector(
	selectKioskState,
	(state) => state.listPagination,
);

export const selectKioskLogs = createSelector(
	selectKioskState,
	(state) => state.kioskLogs,
);

export const selectKioskLogsPagination = createSelector(
	selectKioskState,
	(state) => state.kioskLogsPagination,
);