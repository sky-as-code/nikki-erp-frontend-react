import { Anchor, Breadcrumbs, Center, Flex, Group, SegmentedControl, Text } from '@mantine/core';
import { IconLayoutGridFilled, IconList } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { DriveFile, DriveFileStatus } from '@/features/files/types';

import { useCurrentFileSortedAncestors } from '../hooks/useCurrentFileAncestor';
import type { DriveFileUIViewMode } from './DriveFileView';


export type DriveFallbackTitleKey = 'nikki.drive.myFiles' | 'nikki.drive.trash';

interface DriveFileTitleProps {
	currentFolder?: DriveFile;
	fallbackTitleKey?: DriveFallbackTitleKey;
	fallbackTitle?: string;
	viewMode: DriveFileUIViewMode;
	onViewModeChange: (mode: DriveFileUIViewMode) => void;
	showTrashWarning?: boolean;
}

function BreadcrumbDriveFile({
	currentFileAncestors,
}: { currentFileAncestors: DriveFile[] }): React.ReactNode {
	const { t } = useTranslation();

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

export function DriveFileTitle({
	currentFolder,
	fallbackTitleKey,
	fallbackTitle,
	viewMode,
	onViewModeChange,
	showTrashWarning,
}: DriveFileTitleProps): React.ReactNode {
	const { t } = useTranslation();
	const currentFileAncestors = useCurrentFileSortedAncestors();

	const resolvedFallback = fallbackTitleKey
		? t(fallbackTitleKey)
		: (fallbackTitle ?? t('nikki.drive.myFiles'));
	const title = currentFolder ? currentFolder.name : resolvedFallback;

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
					<Text
						size='xl'
						fw='bold'
					>
						{title}
					</Text>
				)}
				{showTrashWarning && (
					<Text
						size='sm'
						c='red'
						component='span'
						dangerouslySetInnerHTML={{ __html: t('nikki.drive.trashWarning') }}
					/>
				)}
			</Group>
			<SegmentedControl
				value={viewMode}
				onChange={(value: string) => onViewModeChange(value as DriveFileUIViewMode)}
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
		</Flex>
	);
}

