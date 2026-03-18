import { Box, Paper, Stack } from '@mantine/core';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { driveFileActions } from '@/appState/file';
import { DriveFileStatus } from '@/features/files';
import { DriveFileTitle } from '@/features/files/components/DriveFileTitle';
import { DriveFileView, type DriveFileUIViewMode } from '@/features/files/components/DriveFileView';
import { DriveFileFilterBar } from '@/features/files/components/filters/DriveFileFilterBar';
import { useDriveFileList } from '@/features/files/hooks';
import { useDriveFileFilters } from '@/features/files/hooks/useDriveFileFilters';
import { useLocalStorage } from '@/features/files/hooks/useLocalStorage';


const PAGE_SIZE = 20;

function TrashPageBody(): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const { page, setPage, totalItems } = useDriveFileList({
		mode: 'trash',
		pageSize: PAGE_SIZE,
	});

	const VIEW_MODE_KEY = 'drive_viewMode';
	const [viewMode, setViewMode] = useLocalStorage<DriveFileUIViewMode>(
		VIEW_MODE_KEY,
		'list',
		{
			parse: (s) => (s === 'grid' || s === 'list' ? s : 'list'),
			serialize: (v) => v,
		},
	);

	useEffect(() => {
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetCurrentFolder(),
		);
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetDriveFileAncestors(),
		);
	}, [dispatch]);

	const { filters, setFilters, handleApplyFilters } = useDriveFileFilters({
		pageSize: PAGE_SIZE,
		// Trash: luôn filter theo status = IN_TRASH
		baseConditions: [
			{ if: ['status', '=', DriveFileStatus.IN_TRASH] },
		],
		onBeforeApply: () => {
			setPage(1);
		},
		onApply: (req) => {
			(dispatch as (args: unknown) => void)(
				driveFileActions.searchDriveFile({ req }),
			);
		},
	});

	return (
		<Paper h='100%' flex={1} mih={0} p='lg'>
			<Stack gap='sm' h='100%'>
				<Box>
					<DriveFileTitle
						fallbackTitleKey='nikki.drive.trash'
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						showTrashWarning
					/>
				</Box>
				<Box>
					<DriveFileFilterBar
						value={filters}
						onChange={setFilters}
						onApply={handleApplyFilters}
						enabledFields={['visibility', 'type']}
					/>
				</Box>
				<Box h='100%' flex={1} mih={0}>
					<DriveFileView
						viewMode={viewMode}
						totalItems={totalItems}
						page={page}
						onPageChange={setPage}
						showCreateButton={false}
					/>
				</Box>
			</Stack>
		</Paper>
	);
}

export const TrashPage = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.drive.pageTitle.trash');
	}, [translate]);
	return <TrashPageBody />;
};
