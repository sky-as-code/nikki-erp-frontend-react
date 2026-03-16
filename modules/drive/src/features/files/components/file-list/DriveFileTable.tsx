import { Badge, Box, Button, Flex } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { IconPlus } from '@tabler/icons-react';
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
	getDriveFileStatusBadge,
	DriveFileVisibility,
} from '../../types';
import { FileActionMenu } from '../file-actions';

import type { DriveFileStatus as DriveFileStatusType } from '../../types';



const MIN_LOADING_MS = 300;

function StatusBadge({ status }: { status: DriveFileStatusType }): React.ReactNode {
	const { label, color } = getDriveFileStatusBadge(status);
	return <Badge size='sm' color={color} variant='light'>{label}</Badge>;
}

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NameCell({ file }: { file: DriveFile }): React.ReactNode {
	const { openFolder, previewFile } = useDriveFileActions(file);
	const handleClick = () => (file.isFolder ? openFolder() : previewFile());
	return (
		<Box component='span' style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={handleClick}>
			{file.name}
		</Box>
	);
}

export type DriveFileTableProps = {
	showCreate?: boolean;
};

export function DriveFileTable({ showCreate = true }: DriveFileTableProps): React.ReactNode {
	const files = useMicroAppSelector(selectDriveFileList);
	const currentFolder = useMicroAppSelector(selectCurrentFolder);
	const { status } = useMicroAppSelector(selectGetDriveFileByParent);
	const isShowingLoading = useMinimumLoading(status === 'pending', MIN_LOADING_MS);
	const { formatDateTime } = useDbDateTime();
	const openCreate = useOpenCreateFileModal();
	const { t } = useTranslation();

	const showAdd = showCreate && currentFolder?.status !== DriveFileStatus.IN_TRASH;

	if (files.length === 0 && !isShowingLoading) {
		return (
			<Box mah='100%' style={{ overflow: 'auto' }}>
				{showAdd && (
					<Flex mb='sm' gap='xs'>
						<Button
							leftSection={<IconPlus size={16} />}
							variant='light'
							size='sm'
							onClick={() => openCreate(false)}
						>
							{t('nikki.drive.createFile.createFile')}
						</Button>
						<Button
							leftSection={<IconPlus size={16} />}
							variant='light'
							size='sm'
							onClick={() => openCreate(true)}
						>
							{t('nikki.drive.createFile.createFolder')}
						</Button>
					</Flex>
				)}
				<EmptyFilesState />
			</Box>
		);
	}

	const data = files as unknown as Record<string, unknown>[];

	return (
		<Box mah='100%' style={{ overflow: 'auto' }}>
			{showAdd && (
				<Flex mb='sm' gap='xs'>
					<Button
						leftSection={<IconPlus size={16} />}
						variant='light'
						size='sm'
						onClick={() => openCreate(false)}
					>
						{t('nikki.drive.createFile.createFile')}
					</Button>
					<Button
						leftSection={<IconPlus size={16} />}
						variant='light'
						size='sm'
						onClick={() => openCreate(true)}
					>
						{t('nikki.drive.createFile.createFolder')}
					</Button>
				</Flex>
			)}
			<AutoTable
				columns={[...DRIVE_FILE_TABLE_COLUMNS]}
				data={data}
				schema={DRIVE_FILE_TABLE_SCHEMA}
				isLoading={isShowingLoading}
				columnAsId='id'
				columnRenderers={{
					name: (row) => <NameCell file={row as unknown as DriveFile} />,
					type: (row) => (row as unknown as DriveFile).isFolder
						? t('nikki.drive.propertiesCard.folder')
						: t('nikki.drive.propertiesCard.file'),
					size: (row) => {
						const f = row as unknown as DriveFile;
						return f.isFolder ? '—' : formatSize(f.size);
					},
					visibility: (row) => {
						const v = (row as unknown as DriveFile).visibility;
						const labels: Record<DriveFileVisibility, string> = {
							[DriveFileVisibility.PUBLIC]: t('nikki.drive.propertiesCard.visibilityPublic'),
							[DriveFileVisibility.OWNER]: t('nikki.drive.propertiesCard.visibilityOwner'),
							[DriveFileVisibility.SHARED]: t('nikki.drive.propertiesCard.visibilityPrivate'),
						};
						return labels[v] ?? v;
					},
					status: (row) => <StatusBadge status={(row as unknown as DriveFile).status} />,
					createdAt: (row) => formatDateTime((row as unknown as DriveFile).createdAt),
					actions: (row) => (
						<Box component='span' onClick={(e: React.MouseEvent) => e.stopPropagation()}>
							<FileActionMenu file={row as unknown as DriveFile} />
						</Box>
					),
				}}
			/>
		</Box>
	);
}
