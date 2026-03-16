import { Box, Flex, Pagination } from '@mantine/core';
import React, { Fragment } from 'react';

import { DriveFileGrid, DriveFileTable } from './file-list';
import { DriveFileModal } from './modals';


const PAGE_SIZE = 20;

export type DriveFileUIViewMode = 'grid' | 'list';

type DriveFileViewProps = {
	totalItems: number;
	page: number;
	onPageChange: (page: number) => void;
	viewMode: DriveFileUIViewMode;
	showCreateButton?: boolean;
};

export function DriveFileView({
	totalItems,
	page,
	onPageChange,
	viewMode,
	showCreateButton = true,
}: DriveFileViewProps): React.ReactNode {
	const { t } = useTranslation();
	const totalPages = totalItems > 0 ? Math.ceil(totalItems / PAGE_SIZE) : 0;

	return (
		<Flex
			direction='column'
			h='100%'
			bdrs='sm'
			gap='md'
			style={{ boxSizing: 'border-box', overflow: 'hidden' }}
		>
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
	);
}

type FilesViewProps = {
	viewMode: 'grid' | 'list';
	showCreate?: boolean;
};

function FilesView({ viewMode, showCreate = true }: FilesViewProps): React.ReactNode {
	return (
		<Box h='100%' flex={1} mih={0} style={{ overflow: 'hidden' }}>
			{viewMode === 'grid'
				? <DriveFileGrid showCreate={showCreate} />
				: <DriveFileTable showCreate={showCreate} />}
		</Box>
	);
}
