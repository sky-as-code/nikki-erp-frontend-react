import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { driveFileActions } from '@/appState/file';
import { DriveFileView } from '@/features/files/components/DriveFileView';
import { useDriveFileList } from '@/features/files/hooks';


const PAGE_SIZE = 20;

function TrashPageBody(): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const { page, setPage, totalItems } = useDriveFileList({
		mode: 'trash',
		pageSize: PAGE_SIZE,
	});

	useEffect(() => {
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetCurrentFolder(),
		);
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetDriveFileAncestors(),
		);
	}, [dispatch]);

	return (
		<DriveFileView
			currentFolder={undefined}
			totalItems={totalItems}
			page={page}
			onPageChange={setPage}
			fallbackTitleKey='nikki.drive.trash'
			initialViewMode='list'
			showTrashWarning={true}
			showCreateButton={false}
		/>
	);
}

export const TrashPage = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.drive.pageTitle.trash');
	}, [translate]);
	return <TrashPageBody />;
};
