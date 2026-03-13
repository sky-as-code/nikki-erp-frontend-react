import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { driveFileActions, selectCurrentFolder, selectGetDriveFileByParent } from '@/appState/file';
import { DriveFileView } from '@/features/files/components/DriveFileView';
import { DriveFileStatus } from '@/features/files/types';


export function FolderContainer(): React.ReactNode {
	const { driveFileId } = useParams<{ driveFileId: string }>();
	const dispatch = useMicroAppDispatch();
	const currentFolder = useMicroAppSelector(selectCurrentFolder);
	const getByParentState = useMicroAppSelector(selectGetDriveFileByParent);

	const PAGE_SIZE = 20;
	const [page, setPage] = useState(1);

	// Nếu không có driveFileId (route /my-files), coi như đang ở root ('')
	const currentFileId = driveFileId ?? '';

	useEffect(() => {
		setPage(1);
	}, [currentFileId]);

	useEffect(() => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.getDriveFileByParent({
				parentId: currentFileId,
				req: {
					page: page - 1,
					size: PAGE_SIZE,
					graph: {
						if: ['status', '!=', DriveFileStatus.IN_TRASH],
					},
				},
			}),
		);
	}, [currentFileId, page, dispatch]);

	useEffect(() => {
		if (!currentFileId) {
			(dispatch as (args: unknown) => void)(
				driveFileActions.resetCurrentFolder(),
			);
			(dispatch as (args: unknown) => void)(
				driveFileActions.resetDriveFileAncestors(),
			);
			return;
		}
		(dispatch as (args: unknown) => void)(
			driveFileActions.getCurrentFolderById(currentFileId),
		);
		(dispatch as (args: unknown) => void)(
			driveFileActions.getDriveFileAncestors(currentFileId),
		);
	}, [currentFileId, dispatch]);

	const totalItems = getByParentState.data?.total ?? 0;


	return (
		<DriveFileView
			currentFolder={currentFolder}
			totalItems={totalItems}
			page={page}
			onPageChange={setPage}
			fallbackTitle='My files'
			initialViewMode='grid'
			showTrashWarning={
				currentFolder?.status === DriveFileStatus.IN_TRASH ||
				currentFolder?.status === DriveFileStatus.PARENT_IN_TRASH
			}
		/>
	);
}
