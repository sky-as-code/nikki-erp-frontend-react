import { createSelector } from '@reduxjs/toolkit';

import {
	DriveFileShareState,
	createFileShare,
	createFileShareBulk,
	deleteFileShare,
	getFileShare,
	getFileShareAncestors,
	getFileSharesByUser,
	getResolvedFileShares,
	initialState,
	reducer,
	resetAncestors,
	resetCreate,
	resetCreateBulk,
	resetDeleteShare,
	resetGetById,
	resetResolved,
	resetSelectedShare,
	resetShareSearch,
	resetSharesByUser,
	resetUpdate,
	searchFileShares,
	updateFileShare,
} from '@/features/fileShare/fileShareSlice';


const STATE_KEY = 'fileShare';

export const actionReducer = {
	[STATE_KEY]: reducer,
};

export const driveFileShareActions = {
	searchFileShares,
	getFileShare,
	updateFileShare,
	createFileShare,
	createFileShareBulk,
	deleteFileShare,
	getFileShareAncestors,
	getResolvedFileShares,
	getFileSharesByUser,
	resetSelectedShare,
	resetShareSearch,
	resetUpdate,
	resetGetById,
	resetCreate,
	resetCreateBulk,
	resetDeleteShare,
	resetAncestors,
	resetResolved,
	resetSharesByUser,
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

export const selectDriveFileShareCreateState = createSelector(
	selectDriveFileShareState,
	(state) => state.create,
);

export const selectDriveFileShareCreateBulkState = createSelector(
	selectDriveFileShareState,
	(state) => state.createBulk,
);

export const selectDriveFileShareDeleteState = createSelector(
	selectDriveFileShareState,
	(state) => state.deleteShare,
);

export const selectDriveFileShareAncestorsState = createSelector(
	selectDriveFileShareState,
	(state) => state.ancestors,
);

export const selectDriveFileShareResolvedState = createSelector(
	selectDriveFileShareState,
	(state) => state.resolved,
);

export const selectDriveFileShareSharesByUserState = createSelector(
	selectDriveFileShareState,
	(state) => state.sharesByUser,
);
