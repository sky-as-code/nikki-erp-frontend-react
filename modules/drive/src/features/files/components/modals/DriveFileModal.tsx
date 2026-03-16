import { Loader, Modal } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';

import { DriveFileModalUIState } from '../../fileSlice';
import {
	PreviewFileModalContent,
	FilePropertiesModalContent,
	FileSelectorModalContent,
	UpdateFileMetadataModal,
	DeleteConfirmModalContent,
	CreateFileModalContent,
} from './contents';
import { useRefreshCurrentFolder } from '../../hooks';
import { DriveFile } from '../../types';

import {
	driveFileActions,
	selectCurrentFolder,
	selectDriveFileDetail,
	selectDriveFileModalUIState,
} from '@/appState/file';


export function DriveFileModal() {
	const uiState = useMicroAppSelector(selectDriveFileModalUIState) as DriveFileModalUIState;
	const dispatch = useMicroAppDispatch();
	const currentFolder = useMicroAppSelector(selectCurrentFolder);
	const { refresh } = useRefreshCurrentFolder();

	const handleCloseModal = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.resetDriveFileModal(),
		);
	};

	let content: React.ReactNode;

	switch (uiState.type.type) {
		case 'properties':
		case 'update':
		case 'delete-confirm':
		case 'file-selector':
		case 'preview':
			content = <DriveFileActionModalContent uiState={uiState} handleCloseModal={handleCloseModal} />;
			break;

		case 'create':
			content = <CreateFileModalContent
				parentId={currentFolder?.id ?? ''}
				opened={uiState.openedModal}
				defaultIsFolder={uiState.type.defaultIsFolder}
				onClose={() => { handleCloseModal(); }}
				onSuccess={() => {
					refresh({ includeTree: true, treePageSize: 50 });
				}}
			/>;
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

function DriveFileActionModalContent({ uiState, handleCloseModal }: {
	uiState: DriveFileModalUIState, handleCloseModal: () => void
}) {
	const fileDetail = useMicroAppSelector(selectDriveFileDetail) as DriveFile | undefined;

	if (!fileDetail) {
		return <Loader/>;
	}

	switch (uiState.type.type) {
		case 'properties':
			return <FilePropertiesModalContent file={fileDetail} />;

		case 'update':
			return <UpdateFileMetadataModal
				file={fileDetail}
				opened={uiState.openedModal}
				onClose={() => { handleCloseModal(); }}
			/>;

		case 'file-selector':
			return <FileSelectorModalContent
				onClose={() => { handleCloseModal(); }}
				afterSelectFn={uiState.type.afterSelectFn}
				mode={uiState.type.mode}
				multiple={uiState.type.multiple}
				action={uiState.type.action}
			/>;

		case 'delete-confirm':
			return (
				<DeleteConfirmModalContent
					fileId={uiState.type.fileId}
					fileName={uiState.type.fileName}
					parentDriveFileRef={uiState.type.parentDriveFileRef}
					onClose={() => { handleCloseModal(); }}
				/>
			);

		case 'preview':
			return (
				<PreviewFileModalContent
					file={fileDetail}
					onClose={() => { handleCloseModal(); }}
				/>
			);
	}
}
