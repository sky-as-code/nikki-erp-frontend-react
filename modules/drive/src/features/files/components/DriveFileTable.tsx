import { Box, Badge, Skeleton, Table } from '@mantine/core';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { selectDriveFileList, selectGetDriveFileByParent } from '@/appState/file';
import { useDbDateTime } from '@/hooks';

import { useDriveFileActions, useMinimumLoading } from '../hooks';
import { getDriveFileStatusBadge, DriveFileVisibility } from '../types';
import { EmptyFilesState } from './EmptyFilesState';
import { FileActionMenu } from './FileActionMenu';

import type { DriveFile } from '../types';
import type { DriveFileStatus } from '../types';


const MIN_LOADING_MS = 300;

function StatusBadge({ status }: { status: DriveFileStatus }): React.ReactNode {
	const { label, color } = getDriveFileStatusBadge(status);
	return <Badge size='sm' color={color} variant='light'>{label}</Badge>;
}

export function DriveFileTable(): React.ReactNode {
	const files = useMicroAppSelector(selectDriveFileList);
	const { status } = useMicroAppSelector(selectGetDriveFileByParent);
	const isShowingLoading = useMinimumLoading(status === 'pending', MIN_LOADING_MS);
	const { formatDateTime } = useDbDateTime();

	if (isShowingLoading) {
		return (
			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Name</Table.Th>
						<Table.Th>Type</Table.Th>
						<Table.Th>Size</Table.Th>
						<Table.Th>Visibility</Table.Th>
						<Table.Th>Status</Table.Th>
						<Table.Th>Created at</Table.Th>
						<Table.Th>Action</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{Array.from({ length: 5 }).map((_, index) => (
						<Table.Tr key={index}>
							<Table.Td><Skeleton height={14} width='80%' /></Table.Td>
							<Table.Td><Skeleton height={14} width='50%' /></Table.Td>
							<Table.Td><Skeleton height={14} width='40%' /></Table.Td>
							<Table.Td><Skeleton height={14} width='60%' /></Table.Td>
							<Table.Td><Skeleton height={14} width='60%' /></Table.Td>
							<Table.Td><Skeleton height={14} width='70%' /></Table.Td>
							<Table.Td><Skeleton height={24} width={24} circle /></Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		);
	}

	if (files.length === 0) {
		return <EmptyFilesState />;
	}

	return (
		<Box mah={'100%'} style={{ overflowY: 'auto' }}>
			<Table striped highlightOnHover>
				<Table.Thead
					pos='sticky'
					top={0}
					style={{ zIndex: 10 }}
					bg='white'
				>
					<Table.Tr>
						<Table.Th>Name</Table.Th>
						<Table.Th>Type</Table.Th>
						<Table.Th>Size</Table.Th>
						<Table.Th>Visibility</Table.Th>
						<Table.Th>Status</Table.Th>
						<Table.Th>Created at</Table.Th>
						<Table.Th>Action</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{files.map((file: DriveFile) => (
						<DriveFileTableRow
							key={file.id}
							file={file}
							formatDateTime={formatDateTime}
						/>
					))}
				</Table.Tbody>
			</Table>
		</Box>
	);
}

type DriveFileTableRowProps = {
	file: DriveFile;
	formatDateTime: (d: Date | string) => string;
};

function DriveFileTableRow(
	{ file, formatDateTime }: DriveFileTableRowProps,
): React.ReactNode {
	const { openFolder, openProperties } = useDriveFileActions(file);

	const handleRowClick = () => {
		if (file.isFolder) {
			openFolder();
		}
		else {
			openProperties();
		}
	};

	return (
		<Table.Tr onClick={handleRowClick}>
			<Table.Td>{file.name}</Table.Td>
			<Table.Td>{file.isFolder ? 'Folder' : 'File'}</Table.Td>
			<Table.Td>{file.isFolder ? '—' : formatSize(file.size)}</Table.Td>
			<Table.Td>{formatVisibility(file.visibility)}</Table.Td>
			<Table.Td>
				<StatusBadge status={file.status} />
			</Table.Td>
			<Table.Td>{formatDateTime(file.createdAt)}</Table.Td>
			<Table.Td onClick={(e) => e.stopPropagation()}>
				<FileActionMenu file={file} />
			</Table.Td>
		</Table.Tr>
	);
}

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatVisibility(visibility: DriveFileVisibility): string {
	const labels: Record<DriveFileVisibility, string> = {
		[DriveFileVisibility.PUBLIC]: 'Public',
		[DriveFileVisibility.OWNER]: 'Owner',
		[DriveFileVisibility.SHARED]: 'Private',
	};
	return labels[visibility] ?? visibility;
}
