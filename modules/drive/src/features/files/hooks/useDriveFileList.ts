/* eslint-disable max-lines-per-function */
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useEffect, useState } from 'react';

import { DriveFileStatus } from '../types';

import { driveFileActions, selectCurrentFolder, selectGetDriveFileByParent, selectSearchDriveFile } from '@/appState/file';



export type DriveFileListMode = 'folder' | 'trash' | 'shared';

export type UseDriveFileListParams = {
	mode: DriveFileListMode;
	parentId?: string;
	pageSize?: number;
};

export function useDriveFileList({ mode, parentId = '', pageSize = 20 }: UseDriveFileListParams) {
	const dispatch = useMicroAppDispatch();
	const [page, setPage] = useState(1);

	const getByParentState = useMicroAppSelector(selectGetDriveFileByParent);
	const searchState = useMicroAppSelector(selectSearchDriveFile);
	const currentFolder = useMicroAppSelector(selectCurrentFolder);

	useEffect(() => {
		setPage(1);
	}, [mode, parentId]);

	useEffect(() => {
		if (mode === 'folder') {
			(dispatch as (action: unknown) => void)(
				driveFileActions.getDriveFileByParent({
					parentId,
					req: {
						page: page - 1,
						size: pageSize,
						graph: {
							if: ['status', '!=', DriveFileStatus.IN_TRASH],
						},
					},
				}),
			);
		}
		else if (mode === 'trash') {
			(dispatch as (action: unknown) => void)(
				driveFileActions.searchDriveFile({
					req: {
						page: page - 1,
						size: pageSize,
						graph: {
							if: ['status', '=', DriveFileStatus.IN_TRASH],
						},
					},
				}),
			);
		}
		else if (mode === 'shared') {
			(dispatch as (action: unknown) => void)(
				driveFileActions.searchDriveFileShared({
					req: {
						page: page - 1,
						size: pageSize,
						graph: {
							if: ['status', '!=', DriveFileStatus.IN_TRASH],
						},
					},
				}),
			);
		}
	}, [dispatch, mode, parentId, page, pageSize]);

	const state = mode === 'folder' ? getByParentState : searchState;
	const totalItems = state.data?.total ?? 0;

	return {
		page,
		setPage,
		totalItems,
		currentFolder: mode === 'folder' ? currentFolder : undefined,
	};
}

