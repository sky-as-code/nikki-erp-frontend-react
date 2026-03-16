import { Anchor, Box, Breadcrumbs, Center, Flex, Group, Pagination, Paper, SegmentedControl, Text } from '@mantine/core';
import { IconLayoutGridFilled, IconList } from '@tabler/icons-react';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { DriveFile, DriveFileStatus } from '@/features/files/types';

import { DriveFileGrid, DriveFileTable } from './file-list';
import { DriveFileModal } from './modals';
import { useCurrentFileSortedAncestors } from '../hooks/useCurrentFileAncestor';
import { useLocalStorage } from '../hooks/useLocalStorage';




export type DriveFallbackTitleKey = 'nikki.drive.myFiles' | 'nikki.drive.trash';

interface FolderHeaderProps {
	currentFolder?: DriveFile;
	viewMode: 'grid' | 'list';
	setViewMode: (mode: 'grid' | 'list') => void;
	fallbackTitleKey?: DriveFallbackTitleKey;
	fallbackTitle?: string;
	showTrashWarning?: boolean;
}

function BreadcrumbDriveFile({
	currentFileAncestors,
	t,
}: { currentFileAncestors: DriveFile[]; t: (key: string) => string }): React.ReactNode {
	if (currentFileAncestors.length === 0) {
		return null;
	}

	const rootAncestor = currentFileAncestors[0];
	const isInTrash =
		rootAncestor.status === DriveFileStatus.IN_TRASH ||
		rootAncestor.status === DriveFileStatus.PARENT_IN_TRASH;

	const rootLabel = isInTrash ? t('nikki.drive.trash') : t('nikki.drive.myFiles');
	const rootItem = (
		<Anchor
			component={Link}
			key={isInTrash ? 'root-trash' : 'root-my-files'}
			to={isInTrash ? '../trash' : '../my-files'}
		>
			{rootLabel}
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

function FolderHeader({
	currentFolder,
	viewMode,
	setViewMode,
	fallbackTitleKey,
	fallbackTitle,
	showTrashWarning,
	t,
}: FolderHeaderProps & { t: (key: string) => string }): React.ReactNode {
	const resolvedFallback = fallbackTitleKey ? t(fallbackTitleKey) : (fallbackTitle ?? t('nikki.drive.myFiles'));
	const title = currentFolder ? currentFolder.name : resolvedFallback;
	const currentFileAncestors = useCurrentFileSortedAncestors();

	return (
		<Flex
			dir='row'
			justify='space-between'
			align='center'
		>
			<Group gap='sm' align='center'>
				{currentFileAncestors.length > 0 ? (
					<BreadcrumbDriveFile currentFileAncestors={currentFileAncestors} t={t} />
				) : (
					<Text
						size='xl'
						fw='bold'
					>{title}</Text>
				)}
			</Group>
			<Group>
				{
					showTrashWarning && (
						<Text
							size='sm'
							c='red'
							component='span'
							dangerouslySetInnerHTML={{ __html: t('nikki.drive.trashWarning') }}
						/>
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
	/** Prefer this so the header translates inside the view and updates on language change. */
	fallbackTitleKey?: DriveFallbackTitleKey;
	fallbackTitle?: string;
	initialViewMode?: DriveFileUIViewMode;
	showTrashWarning?: boolean;
	showCreateButton?: boolean;
};

export function DriveFileView({
	currentFolder,
	totalItems,
	page,
	onPageChange,
	fallbackTitleKey,
	fallbackTitle,
	initialViewMode = 'grid',
	showTrashWarning,
	showCreateButton = true,
}: DriveFileViewProps): React.ReactNode {
	const { t } = useTranslation();
	const totalPages = totalItems > 0 ? Math.ceil(totalItems / PAGE_SIZE) : 0;
	const VIEW_MODE_KEY = 'drive_viewMode';

	const [viewMode, setViewMode] = useLocalStorage<DriveFileUIViewMode>(
		VIEW_MODE_KEY,
		initialViewMode,
		{
			parse: (s) => (s === 'grid' || s === 'list' ? s : initialViewMode),
			serialize: (v) => v,
		},
	);

	return (
		<Paper h='100%' flex={1} mih={0}>
			<Flex
				direction='column'
				mah='100%'
				bdrs='sm'
				p='lg'
				gap='md'
				style={{ boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)', boxSizing: 'border-box', overflow: 'hidden' }}
			>
				<FolderHeader
					currentFolder={currentFolder}
					viewMode={viewMode}
					setViewMode={setViewMode}
					fallbackTitleKey={fallbackTitleKey}
					fallbackTitle={fallbackTitle}
					showTrashWarning={showTrashWarning}
					t={t}
				/>
				<FilesView
					viewMode={viewMode}
					showCreate={showCreateButton}
				/>
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
				<DriveFileModal />
			</Flex>
		</Paper>
	);
}

type FilesViewProps = {
	viewMode: 'grid' | 'list';
	showCreate?: boolean;
};

function FilesView({ viewMode, showCreate = true }: FilesViewProps): React.ReactNode {
	return (
		<Box flex={1} miw={0} style={{ overflow: 'auto' }}>
			{viewMode === 'grid'
				? <DriveFileGrid showCreate={showCreate} />
				: <DriveFileTable showCreate={showCreate} />}
		</Box>
	);
}
