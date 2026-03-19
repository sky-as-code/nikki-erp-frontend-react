import { Box, Card, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { Fragment } from 'react';

import {
	selectCurrentFolder,
	selectDriveFileList,
	selectGetDriveFileByParent,
} from '@/appState/file';
import { useDriveStreamUrl } from '@/hooks/useDriveStreamUrl';

import { EmptyFilesState } from '../..';
import { FileActionMenu } from '../file-actions';
import { AddFileCard } from './AddFileCard';
import { DriveFileIcon } from './DriveFileIcon';
import { useDriveFileActions, useMinimumLoading } from '../../hooks';
import { DriveFileStatus, type DriveFile } from '../../types';
import { formatSize } from '../../utils';


const MIN_LOADING_MS = 300;

export type DriveFileGridProps = {
	showCreate?: boolean;
};

export function DriveFileGrid({ showCreate = true }: DriveFileGridProps): React.ReactNode {
	const files = useMicroAppSelector(selectDriveFileList);
	const currentFolder = useMicroAppSelector(selectCurrentFolder);
	const { status } = useMicroAppSelector(selectGetDriveFileByParent);
	const isShowingLoading = useMinimumLoading(status === 'pending', MIN_LOADING_MS);

	if (isShowingLoading && files.length === 0) {
		return (
			<Box mah={'100%'} h={'100%'} w='100%'>
				<SimpleGrid
					cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
					spacing='md'
				>
					{showCreate && <AddFileCard />}
					{Array.from({ length: 8 }).map((_, index) => (
						<SkeletonFileCard key={index} />
					))}
				</SimpleGrid>
			</Box>
		);
	}

	if (!isShowingLoading && files.length === 0) {
		return <Box pos={'relative'} mah={'100%'} h={'100%'} w='100%'>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing='md'
			>
				{showCreate && <AddFileCard />}
			</SimpleGrid>
			<EmptyFilesState />
		</Box>;
	}

	return (
		<Box mah='100%' w='100%' style={{ overflow: 'auto' }}>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing='md'
			>
				<Fragment>
					{showCreate && currentFolder?.status !== DriveFileStatus.IN_TRASH && <AddFileCard />}
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
			mih={140}
			h='100%'
			style={{ cursor: 'default' }}
		>
			<Stack gap='xs' flex={1}>
				<Skeleton circle height={32} />
				<Skeleton height={14} width='80%' />
				<Skeleton height={10} width='40%' />
			</Stack>
		</Card>
	);
}

function FileCard({ file }: { file: DriveFile }): React.ReactNode {
	const sizeLabel = formatSize(file.size);
	const { previewFile, openFolder } = useDriveFileActions(file);
	const buildStreamUrl = useDriveStreamUrl();
	const imageUrl = file.type === 'image' ? buildStreamUrl(file.id, false) : undefined;

	const handleClick = () => {
		if (file.isFolder) {
			openFolder();
		}
		else {
			previewFile();
		}
	};

	return (
		<Card
			withBorder
			shadow='xs'
			radius='lg'
			p='md'
			onClick={handleClick}
			mih={140}
			h='100%'
			style={{ cursor: 'pointer' }}
		>
			<Stack gap='xs' flex={1}>
				<Box
					pos='absolute'
					top={4}
					right={4}
					onClick={(e) => e.stopPropagation()}
				>
					<FileActionMenu file={file} />
				</Box>
				<DriveFileIcon
					type={file.type}
					url={imageUrl}
					size={32}
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
