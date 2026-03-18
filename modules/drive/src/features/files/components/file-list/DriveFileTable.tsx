import { Badge, Box, Button, Flex } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { IconFilePlus, IconFolderPlus } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectCurrentFolder, selectDriveFileList, selectGetDriveFileByParent } from '@/appState/file';
import { useDbDateTime } from '@/hooks';

import {
	DRIVE_FILE_TABLE_COLUMNS,
	DRIVE_FILE_TABLE_SCHEMA,
} from './DRIVE_FILE_TABLE_SCHEMA';
import { EmptyFilesState } from './EmptyFilesState';
import { useDriveFileActions, useMinimumLoading, useOpenCreateFileModal } from '../../hooks';
import {
	DriveFile,
	DriveFileStatus,
	DriveFileVisibility,
} from '../../types';
import { formatSize } from '../../utils';
import { DriveFileStatusBadge, DriveFileVisibilityBadge } from '../badges';
import { FileActionMenu } from '../file-actions';


const MIN_LOADING_MS = 300;

function NameCell({ file }: { file: DriveFile }): React.ReactNode {
	const { openFolder, previewFile } = useDriveFileActions(file);
	const handleClick = () => (file.isFolder ? openFolder() : previewFile());
	return (
		<Box component='span' style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={handleClick}>
			{file.name}
		</Box>
	);
}

function useTableRenderers(): Record<string, (row: Record<string, unknown>) => React.ReactNode> {
	const { t } = useTranslation();
	const { formatDateTime } = useDbDateTime();
	return {
		name: (row) => <NameCell file={row as unknown as DriveFile} />,
		type: (row) => (row as unknown as DriveFile).isFolder
			? t('nikki.drive.propertiesCard.folder')
			: t('nikki.drive.propertiesCard.file'),
		size: (row) => {
			const f = row as unknown as DriveFile;
			return f.isFolder ? '—' : formatSize(f.size);
		},
		visibility: (row) => {
			const v = (row as unknown as DriveFile).visibility as DriveFileVisibility;
			return <DriveFileVisibilityBadge e={v} />;
		},
		status: (row) => <DriveFileStatusBadge e={(row as unknown as DriveFile).status as DriveFileStatus} />,
		createdAt: (row) => formatDateTime((row as unknown as DriveFile).createdAt),
		actions: (row) => (
			<Box component='span' onClick={(e: React.MouseEvent) => e.stopPropagation()}>
				<FileActionMenu file={row as unknown as DriveFile} />
			</Box>
		),
	};
};

export type DriveFileTableProps = {
	showCreate?: boolean;
};

export function DriveFileTable({ showCreate = true }: DriveFileTableProps): React.ReactNode {
	const files = useMicroAppSelector(selectDriveFileList);
	const currentFolder = useMicroAppSelector(selectCurrentFolder);
	const { status } = useMicroAppSelector(selectGetDriveFileByParent);
	const isShowingLoading = useMinimumLoading(status === 'pending', MIN_LOADING_MS);
	const openCreate = useOpenCreateFileModal();
	const { t } = useTranslation();

	const showAdd = showCreate && currentFolder?.status !== DriveFileStatus.IN_TRASH;

	if (files.length === 0 && !isShowingLoading) {
		return (
			<Box mah='100%' h={'100%'} pos={'relative'} style={{ overflow: 'auto' }}>
				{showAdd && (
					<AddFileButtons
						openCreateFile={() => openCreate(false)}
						openCreateFolder={() => openCreate(true)}
						t={t}
					/>
				)}
				<EmptyFilesState />
			</Box>
		);
	}

	const data = files as unknown as Record<string, unknown>[];

	return (
		<Box mah='100%' style={{ overflow: 'auto' }}>
			{showAdd && (
				<AddFileButtons
					openCreateFile={() => openCreate(false)}
					openCreateFolder={() => openCreate(true)}
					t={t}
				/>
			)}
			<AutoTable
				columns={[...DRIVE_FILE_TABLE_COLUMNS]}
				data={data}
				schema={DRIVE_FILE_TABLE_SCHEMA}
				isLoading={isShowingLoading}
				columnAsId='id'
				columnRenderers={{
					...useTableRenderers(),
				}}
			/>
		</Box>
	);
}

type AddFileButtonsProps = {
	openCreateFile: () => void;
	openCreateFolder: () => void;
	t: any;
};

function AddFileButtons({ openCreateFile: createFileFn, openCreateFolder: createFolderFn, t,
}: AddFileButtonsProps): React.ReactNode {
	return (
		<Flex mb='sm' gap='xs'>
			<Button
				leftSection={<IconFilePlus size={16} />}
				variant='light'
				size='sm'
				onClick={createFileFn}
			>
				{t('nikki.drive.createFile.createFile')}
			</Button>
			<Button
				leftSection={<IconFolderPlus size={16} />}
				variant='light'
				size='sm'
				onClick={createFolderFn}
			>
				{t('nikki.drive.createFile.createFolder')}
			</Button>
		</Flex>
	);
}
