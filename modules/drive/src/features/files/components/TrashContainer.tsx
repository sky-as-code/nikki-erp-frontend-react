import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useEffect, useState } from 'react';

import { DriveFileStatus } from '../types';

import {
	driveFileActions,
	selectDriveFileDetail,
	selectDriveFileUIState,
	selectSearchDriveFile,
} from '@/appState/file';
import { DriveFileView } from '@/features/files/components/DriveFileView';


const PAGE_SIZE = 20;

export function TrashContainer(): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const searchState = useMicroAppSelector(selectSearchDriveFile);
	const selectedFile = useMicroAppSelector(selectDriveFileDetail);
	const uiState = useMicroAppSelector(selectDriveFileUIState);

	const [page, setPage] = useState(1);

	useEffect(() => {
		setPage(1);
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetCurrentFolder(),
		);
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetDriveFileAncestors(),
		);
	}, []);

	useEffect(() => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.searchDriveFile({
				req: {
					page: page - 1,
					size: PAGE_SIZE,
					// Chỉ lấy những file/folder ở Trash root: status = in-trash
					graph: {
						if: ['status', '=', DriveFileStatus.IN_TRASH],
					},
				},
			}),
		);
	}, [dispatch, page]);

	const totalItems = searchState.data?.total ?? 0;

	// const handleCreateSuccess = () => {
	// 	(dispatch as (action: unknown) => void)(
	// 		driveFileActions.searchDriveFile({
	// 			req: {
	// 				page: page - 1,
	// 				size: PAGE_SIZE,
	// 				graph: {
	// 					if: ['status', '=', DriveFileStatus.IN_TRASH],
	// 				},
	// 			},
	// 		}),
	// 	);
	// };

	return (
		<DriveFileView
			currentFolder={undefined}
			totalItems={totalItems}
			page={page}
			onPageChange={setPage}
			fallbackTitle='Trash'
			initialViewMode='list'
			showTrashWarning={true}
		/>
	);
}

