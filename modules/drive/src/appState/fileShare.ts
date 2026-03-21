import { createSelector } from '@reduxjs/toolkit';

import {
	DriveFileShareState,
	initialState,
	reducer,
	searchFileShares,
	getFileShare,
	updateFileShare,
	resetGetById,
	resetSelectedShare,
	resetShareSearch,
	resetUpdate,
} from '@/features/fileShare/fileShareSlice';

const STATE_KEY = 'fileShare';

export const actionReducer = {
	[STATE_KEY]: reducer,
};

export const driveFileShareActions = {
	searchFileShares,
	getFileShare,
	updateFileShare,
	resetSelectedShare,
	resetShareSearch,
	resetUpdate,
	resetGetById,
};

export const selectDriveFileShareState = (state: {
	[STATE_KEY]: DriveFileShareState;
}) =>
	state[STATE_KEY] ?? initialState;

export const selectDriveFileShareList = createSelector(
	selectDriveFileShareState,
	(state) => state.shares,
);

export const selectDriveFileShareDetail = createSelector(
	selectDriveFileShareState,
	(state) => state.selectedShare,
);

export const selectDriveFileShareSearchState = createSelector(
	selectDriveFileShareState,
	(state) => state.search,
);

export const selectDriveFileShareGetByIdState = createSelector(
	selectDriveFileShareState,
	(state) => state.getById,
);

export const selectDriveFileShareUpdateState = createSelector(
	selectDriveFileShareState,
	(state) => state.update,
);

