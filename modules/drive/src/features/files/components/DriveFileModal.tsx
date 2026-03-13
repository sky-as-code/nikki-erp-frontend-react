import { Modal } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';


import {
	driveFileActions,
	selectCurrentFolder,
	selectDriveFileDetail,
	selectDriveFileModalUIState,
} from '@/appState/file';

import { DriveFileModalUIState } from '../fileSlice';
import {
	CreateFileModal,
	DeleteConfirmModal,
	FilePropertiesCard,
	FileSelectorModal,
	UpdateFileMetadataModal,
} from './modals';
import { useRefreshCurrentFolder } from '../hooks';


export function DriveFileModal() {
	const uiState = useMicroAppSelector(selectDriveFileModalUIState) as DriveFileModalUIState;
	const dispatch = useMicroAppDispatch();
	const currentFolder = useMicroAppSelector(selectCurrentFolder);
	const fileDetail = useMicroAppSelector(selectDriveFileDetail);
	const { refresh } = useRefreshCurrentFolder();

	const handleCloseModal = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.resetDriveFileModal(),
		);
	};

	let content: React.ReactNode;

	switch (uiState.type.type) {
		case 'properties':
			content = <FilePropertiesCard file={fileDetail} />;
			break;

		case 'create':
			content = <CreateFileModal
				parentId={currentFolder?.id || null}
				opened={uiState.openedModal}
				onClose={() => { handleCloseModal(); }}
				onSuccess={() => {
					// Sau khi tạo file, reload lại list + tree với context hiện tại
					refresh({ includeTree: true, treePageSize: 50 });
				}}
			/>;
			break;

		case 'update':
			content = <UpdateFileMetadataModal
				file={fileDetail}
				opened={uiState.openedModal}
				onClose={() => { handleCloseModal(); }}
			/>;
			break;

		case 'file-selector':
			content = <FileSelectorModal
				onClose={() => { handleCloseModal(); }}
				afterSelectFn={uiState.type.afterSelectFn}
				mode={uiState.type.mode}
				multiple={uiState.type.multiple}
				action={uiState.type.action}
			/>;
			break;

		case 'delete-confirm':
			content = (
				<DeleteConfirmModal
					fileId={uiState.type.fileId}
					fileName={uiState.type.fileName}
					parentDriveFileRef={uiState.type.parentDriveFileRef}
					onClose={() => { handleCloseModal(); }}
				/>
			);
			break;
	}

	return (
		<Modal
			opened={uiState.openedModal}
			title={uiState.title}
			centered
			size=''
			// size={uiState.type.type === 'file-selector' ? 'xl' : 'md'}
			withCloseButton
			onClose={() => { handleCloseModal(); }}
		>
			{content}
		</Modal>
	);
}
