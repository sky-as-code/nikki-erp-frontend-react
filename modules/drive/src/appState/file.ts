import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	createDriveFile,
	updateMetadataDriveFile,
	deleteDriveFile,
	moveDriveFileToTrash,
	getDriveFileById,
	getDriveFileByParent,
	getCurrentFolderById,
	getDriveFileByParentForTree,
	searchDriveFile,
	DriveFileState,
	initialState,
	getDriveFileAncestors,
	restoreDriveFileFromTrash,
} from '@/features/files/fileSlice';


const STATE_KEY = 'file';

export const actionReducer = {
	[STATE_KEY]: reducer,
};

export const driveFileActions = {
	createDriveFile,
	updateMetadataDriveFile,
	deleteDriveFile,
	moveDriveFileToTrash,
	getDriveFileById,
	getDriveFileByParent,
	getCurrentFolderById,
	getDriveFileByParentForTree,
	searchDriveFile,
	getDriveFileAncestors,
	restoreDriveFileFromTrash,
	...actions,
};

export const selectDriveFileState = (state: { [STATE_KEY]: DriveFileState }) =>
	state[STATE_KEY] ?? initialState;

export const selectDriveFileList = createSelector(
	selectDriveFileState,
	(state) => state.files,
);

export const selectTreeRootItems = createSelector(
	selectDriveFileState,
	(state) => state.treeRootItems,
);

export const selectTreePaging = createSelector(
	selectDriveFileState,
	(state) => state.treePaging,
);

export const selectTreeExpandedState = createSelector(
	selectDriveFileState,
	(state) => state.treeExpandedState,
);

export const selectCurrentFolder = createSelector(
	selectDriveFileState,
	(state) => state.currentFolder,
);

export const selectDriveFileDetail = createSelector(
	selectDriveFileState,
	(state) => state.fileDetail,
);

export const selectCreateDriveFile = createSelector(
	selectDriveFileState,
	(state) => state.create,
);

export const selectUpdateMetadataDriveFile = createSelector(
	selectDriveFileState,
	(state) => state.updateMetadata,
);

export const selectDeleteDriveFile = createSelector(
	selectDriveFileState,
	(state) => state.delete,
);

export const selectMoveToTrashDriveFile = createSelector(
	selectDriveFileState,
	(state) => state.moveToTrash,
);

export const selectGetDriveFileById = createSelector(
	selectDriveFileState,
	(state) => state.getById,
);

export const selectGetDriveFileByParent = createSelector(
	selectDriveFileState,
	(state) => state.getByParent,
);

export const selectGetDriveFileByParentForTree = createSelector(
	selectDriveFileState,
	(state) => state.getByParentForTree,
);

export const selectSearchDriveFile = createSelector(
	selectDriveFileState,
	(state) => state.search,
);

export const selectRestoreDriveFileFromTrash = createSelector(
	selectDriveFileState,
	(state) => state.restoreFromTrash,
);

export const selectDriveFileUIState = createSelector(
	selectDriveFileState,
	(state) => state.ui,
);

export const selectDriveFileModalUIState = createSelector(
	selectDriveFileState,
	(state) => state.ui.driveFileModal,
);

export const selectDriveFileAncestors = createSelector(
	selectDriveFileState,
	(state) => state.ancestors,
);
