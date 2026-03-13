import { Anchor, Box, Breadcrumbs, Center, Flex, Group, Pagination, SegmentedControl, Text, Title } from '@mantine/core';
import { IconLayoutGridFilled, IconList } from '@tabler/icons-react';
import React, { Fragment, useState } from 'react';
import { Link } from 'react-router';

import { DriveFileGrid, DriveFileTable } from '@/features/files/components';
import { DriveFile, DriveFileStatus } from '@/features/files/types';

import { DriveFileModal } from './DriveFileModal';
import { useCurrentFileSortedAncestors } from '../hooks/useCurrentFileAncestor';


interface FolderHeaderProps {
	currentFolder?: DriveFile;
	viewMode: 'grid' | 'list';
	setViewMode: (mode: 'grid' | 'list') => void;
	fallbackTitle?: string;
	showTrashWarning?: boolean;
}

function BreadcrumbDriveFile({ currentFileAncestors }: { currentFileAncestors: DriveFile[] }): React.ReactNode {
	if (currentFileAncestors.length === 0) {
		return null;
	}

	const rootAncestor = currentFileAncestors[0];
	const isInTrash =
		rootAncestor.status === DriveFileStatus.IN_TRASH ||
		rootAncestor.status === DriveFileStatus.PARENT_IN_TRASH;

	const rootItem = (
		<Anchor
			component={Link}
			key={isInTrash ? 'root-trash' : 'root-my-files'}
			to={isInTrash ? '../trash' : '../my-files'}
		>
			{isInTrash ? 'Trash' : 'My files'}
		</Anchor>
	);

	const ancestorItems = currentFileAncestors.map((ancestor, index) => {
		if (index === currentFileAncestors.length - 1) {
			return (
				<Text
					size='xl'
					fw='bold'
					key={ancestor.parentDriveFileRef || ancestor.id}
				>
					{ancestor.name}
				</Text>
			);
		}

		return (
			<Anchor
				component={Link}
				key={ancestor.parentDriveFileRef || ancestor.id}
				to={`../folder/${ancestor.id}`}
			>
				{ancestor.name}
			</Anchor>
		);
	});

	return <Breadcrumbs>{[rootItem, ...ancestorItems]}</Breadcrumbs>;
}

function FolderHeader({ currentFolder, viewMode, setViewMode, fallbackTitle = 'My files', showTrashWarning }: FolderHeaderProps): React.ReactNode {
	const title = currentFolder ? currentFolder.name : fallbackTitle;
	const currentFileAncestors = useCurrentFileSortedAncestors();

	return (
		<Flex
			dir='row'
			justify='space-between'
			align='center'
		>
			<Group gap='sm' align='center'>
				{currentFileAncestors.length > 0 ? (
					<BreadcrumbDriveFile currentFileAncestors={currentFileAncestors} />
				) : (
					<Title order={1}>{title}</Title>
				)}
			</Group>
			<Group>
				{
					showTrashWarning && (
						<Text
							size='sm'
							c='red'
						>
							*The files in trash will be <b>deleted after 30 days</b>.
						</Text>
					)
				}
				<SegmentedControl
					value={viewMode}
					onChange={(value: string) => setViewMode(value as 'grid' | 'list')}
					data={[
						{
							label: (
								<Center h={20}>
									<IconLayoutGridFilled size={16} stroke={2.5} />
								</Center>
							),
							value: 'grid',
						},
						{
							label: (
								<Center h={20}>
									<IconList size={16} stroke={2.5} />
								</Center>
							),
							value: 'list',
						},
					]}
				/>
			</Group>
		</Flex>
	);
}

const PAGE_SIZE = 20;

export type DriveFileUIViewMode = 'grid' | 'list';

type DriveFileViewProps = {
	currentFolder?: DriveFile;
	totalItems: number;
	page: number;
	onPageChange: (page: number) => void;
	fallbackTitle?: string;
	initialViewMode?: DriveFileUIViewMode;
	showTrashWarning?: boolean;
};

export function DriveFileView({
	currentFolder,
	totalItems,
	page,
	onPageChange,
	fallbackTitle = 'My files',
	initialViewMode = 'grid',
	showTrashWarning,
}: DriveFileViewProps): React.ReactNode {
	const totalPages = totalItems > 0 ? Math.ceil(totalItems / PAGE_SIZE) : 0;
	const VIEW_MODE_KEY = 'drive_viewMode';

	const [viewMode, setViewModeState] = useState<DriveFileUIViewMode>(() => {
		const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(VIEW_MODE_KEY) : null;
		return stored === 'grid' || stored === 'list' ? (stored as DriveFileUIViewMode) : initialViewMode;
	});

	const setViewMode = (mode: DriveFileUIViewMode) => {
		setViewModeState(mode);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(VIEW_MODE_KEY, mode);
		}
	};

	return (
		<Flex
			direction='column'
			h={'100%'}
			bg={'gray.0'}
			bdrs={'lg'}
			p={'lg'}
			gap='md'
			style={{
				boxSizing: 'border-box',
				overflowY: 'hidden',
				border: '1px solid var(--mantine-color-gray-3)',
				boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
			}}
		>
			<FolderHeader
				currentFolder={currentFolder}
				viewMode={viewMode}
				setViewMode={setViewMode}
				fallbackTitle={fallbackTitle}
				showTrashWarning={showTrashWarning}
			/>
			<FilesView viewMode={viewMode} />
			<Fragment>
				{totalPages > 1 && (
					<Pagination
						mt='md'
						value={page}
						total={totalPages}
						onChange={onPageChange}
						size='sm'
					/>
				)}
			</Fragment>
			<DriveFileModal/>
		</Flex>
	);
}

type FilesViewProps = {
	viewMode: 'grid' | 'list';
};

function FilesView({ viewMode }: FilesViewProps): React.ReactNode {
	return (
		<Box style={{ flex: 1, minWidth: 0, overflowY: 'hidden' }}>
			{viewMode === 'grid' ? <DriveFileGrid /> : <DriveFileTable />}
		</Box>
	);
}
