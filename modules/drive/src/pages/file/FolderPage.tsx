import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { driveFileActions } from '@/appState/file';
import { DriveFileStatus } from '@/features/files';
import { DriveFileView } from '@/features/files/components/DriveFileView';
import { useDriveFileList } from '@/features/files/hooks';


function FolderPageBody(): React.ReactNode {
	const { driveFileId } = useParams<{ driveFileId: string }>();
	const dispatch = useMicroAppDispatch();
	const currentFileId = driveFileId ?? '';

	const { page, setPage, totalItems, currentFolder } = useDriveFileList({
		mode: 'folder',
		parentId: currentFileId,
		pageSize: 20,
	});

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

	useEffect(() => {
		if (currentFolder) {
			document.title = `${currentFolder.name} - Drive - Nikki`;
		}
	}, [currentFolder]);

	return (
		<DriveFileView
			currentFolder={currentFolder}
			totalItems={totalItems}
			page={page}
			onPageChange={setPage}
			fallbackTitleKey='nikki.drive.myFiles'
			initialViewMode='grid'
			showTrashWarning={
				currentFolder?.status === DriveFileStatus.IN_TRASH ||
				currentFolder?.status === DriveFileStatus.PARENT_IN_TRASH
			}
		/>
	);
}

export const FolderPage = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.drive.pageTitle.myFiles');
	}, [translate]);
	return <FolderPageBody />;
};
