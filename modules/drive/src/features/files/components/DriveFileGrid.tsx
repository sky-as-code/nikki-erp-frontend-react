import { Box, Card, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { IconFile, IconFolder, IconPlus } from '@tabler/icons-react';
import React, { Fragment } from 'react';
import { useNavigate } from 'react-router';


import { useDriveFileActions, useMinimumLoading } from '../hooks';
import { FileActionMenu } from './FileActionMenu';
import { DriveFileStatus, type DriveFile } from '../types';

import {
	driveFileActions,
	selectCurrentFolder,
	selectDriveFileList,
	selectGetDriveFileByParent,
} from '@/appState/file';


const MIN_LOADING_MS = 300;

export function DriveFileGrid(): React.ReactNode {
	const files = useMicroAppSelector(selectDriveFileList);
	const currentFolder = useMicroAppSelector(selectCurrentFolder);
	const { status } = useMicroAppSelector(selectGetDriveFileByParent);
	const isShowingLoading = useMinimumLoading(status === 'pending', MIN_LOADING_MS);

	if (isShowingLoading && files.length === 0) {
		return (
			<Box mah={'100%'} w='100%'>
				<SimpleGrid
					cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
					spacing='md'
				>
					<AddFileCard />
					{Array.from({ length: 8 }).map((_, index) => (
						<SkeletonFileCard key={index} />
					))}
				</SimpleGrid>
			</Box>
		);
	}

	return (
		<Box mah={'100%'} w='100%' style={{ overflowY: 'auto' }}>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing='md'
			>
				<Fragment>
					{currentFolder?.status !== DriveFileStatus.IN_TRASH && <AddFileCard />}
				</Fragment>
				{files.map((file: DriveFile) => (
					<FileCard key={file.id} file={file} />
				))}
			</SimpleGrid>
		</Box>
	);
}

function SkeletonFileCard(): React.ReactNode {
	return (
		<Card
			withBorder
			shadow='xs'
			radius='md'
			p='md'
			bg='var(--mantine-color-gray-0)'
			style={{
				cursor: 'default',
				display: 'flex',
				flexDirection: 'column',
				minHeight: 140,
			}}
			h='100%'
		>
			<Stack gap='xs' style={{ flex: 1 }}>
				<Skeleton circle height={32} />
				<Skeleton height={14} width='80%' />
				<Skeleton height={10} width='40%' />
			</Stack>
		</Card>
	);
}

function AddFileCard(): React.ReactNode {
	const dispatch = useMicroAppDispatch();

	const create = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: 'Create',
				type: {
					type: 'create',
				},
			}),
		);
	};

	return (
		<Card
			withBorder
			shadow='xs'
			radius='md'
			p='md'
			bg='var(--mantine-color-gray-0)'
			onClick={() => create()}
			style={{
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 140,
			}}
			h='100%'
		>
			<Stack gap='xs' align='center' justify='center'>
				<IconPlus size={24} />
				<Text size='xs' c='dimmed'>
					Add
				</Text>
			</Stack>
		</Card>
	);
}

function FileCard({ file }: { file: DriveFile }): React.ReactNode {
	const isFolder = file.isFolder;
	const Icon = isFolder ? IconFolder : IconFile;
	const sizeLabel = file.size > 0 ? formatSize(file.size) : '—';
	const {openProperties, openFolder} = useDriveFileActions(file);

	const handleClick = () => {
		if (file.isFolder) {
			openFolder();
		}
		else {
			openProperties();
		}
	};

	return (
		<Card
			withBorder
			shadow='xs'
			radius='lg'
			p='md'
			bg='white'
			onClick={handleClick}
			mih={140}
			style={{
				cursor: 'pointer',
				display: 'flex',
				flexDirection: 'column',
				boxShadow: '1px var(--mantine-color-gray-4)',
			}}
			h='100%'
		>
			<Stack gap='xs' style={{ flex: 1 }}>
				<Box
					pos='absolute'
					top={4}
					right={4}
					onClick={(e) => e.stopPropagation()}
				>
					<FileActionMenu file={file} />
				</Box>
				<Icon
					size={32}
					stroke={2}
					color={isFolder ? 'var(--mantine-color-yellow-7)' : 'var(--mantine-color-blue-7)'}
				/>
				<Text size='md' fw={'semibold'} lineClamp={2}>
					{file.name}
				</Text>
				<Text size='xs' c='dimmed'>
					{sizeLabel}
				</Text>
			</Stack>
		</Card>
	);
}

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
