import { Box, Flex, Pagination, Title } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useEffect, useState } from 'react';

import {
	driveFileActions,
	selectDriveFileList,
	selectGetDriveFileByParent,
} from '@/appState/file';

import { DriveFileStatus } from '../types';
import { DriveFileGrid } from './DriveFileGrid';
import { DriveFileTable } from './DriveFileTable';


type ViewMode = 'grid' | 'list';

const PAGE_SIZE = 20;
const VIEW_MODE_KEY = 'drive_trash_viewMode';

export function TrashContainer(): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const files = useMicroAppSelector(selectDriveFileList);
	const getByParentState = useMicroAppSelector(selectGetDriveFileByParent);

	const [page, setPage] = useState(1);
	const [viewMode, setViewModeState] = useState<ViewMode>(() => {
		if (typeof localStorage === 'undefined') return 'list';
		const stored = localStorage.getItem(VIEW_MODE_KEY);
		return stored === 'grid' || stored === 'list' ? stored : 'list';
	});

	useEffect(() => {
		setPage(1);
	}, []);

	useEffect(() => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.getDriveFileByParent({
				parentId: '',
				req: {
					page: page - 1,
					size: PAGE_SIZE,
					// Filter chỉ lấy file trong thùng rác qua graph.
					graph: {
						status: [
							DriveFileStatus.IN_TRASH,
							DriveFileStatus.PARENT_IN_TRASH,
						],
					},
				},
			}),
		);
	}, [dispatch, page]);

	const totalItems = getByParentState.data?.total ?? files.length ?? 0;
	const totalPages = totalItems > 0 ? Math.ceil(totalItems / PAGE_SIZE) : 0;

	const setViewMode = (mode: ViewMode) => {
		setViewModeState(mode);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(VIEW_MODE_KEY, mode);
		}
	};

	const Content = viewMode === 'grid' ? DriveFileGrid : DriveFileTable;

	return (
		<Flex
			direction='column'
			h='100%'
			bg='white'
			bdrs='sm'
			p='lg'
			gap='md'
			style={{
				boxSizing: 'border-box',
				overflowY: 'hidden',
				border: '1px solid var(--mantine-color-gray-3)',
				boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
			}}
		>
			<Flex justify='space-between' align='center'>
				<Title order={1}>Trash</Title>
				<Box>
					{/* Reuse same segmented control style as FolderHeader if muốn,
					 * nhưng để đơn giản, toggle view mode có thể thêm sau */}
				</Box>
			</Flex>

			<Box style={{ flex: 1, minWidth: 0, overflowY: 'hidden' }}>
				<Content />
			</Box>

			{totalPages > 1 && (
				<Pagination
					mt='md'
					value={page}
					total={totalPages}
					onChange={setPage}
					size='sm'
				/>
			)}
		</Flex>
	);
}

