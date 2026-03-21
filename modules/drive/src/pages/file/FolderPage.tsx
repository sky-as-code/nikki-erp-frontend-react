import { Box, Paper, Stack } from '@mantine/core';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { driveFileActions } from '@/appState/file';
import { DriveFileStatus } from '@/features/files';
import { DriveFileTitle } from '@/features/files/components/DriveFileTitle';
import { DriveFileView, type DriveFileUIViewMode } from '@/features/files/components/DriveFileView';
import { DriveFileFilterBar } from '@/features/files/components/Filters/DriveFileFilterBar';
import { useDriveFileList } from '@/features/files/hooks';
import { useDriveFileFilters } from '@/features/files/hooks/useDriveFileFilters';
import { useLocalStorage } from '@/features/files/hooks/useLocalStorage';


type FolderPageLayoutProps = {
	currentFolder?: import('@/features/files').DriveFile;
	viewMode: DriveFileUIViewMode;
	onViewModeChange: (mode: DriveFileUIViewMode) => void;
	filters: ReturnType<typeof useDriveFileFilters>['filters'];
	setFilters: ReturnType<typeof useDriveFileFilters>['setFilters'];
	onApplyFilters: () => void;
	totalItems: number;
	page: number;
	onPageChange: (page: number) => void;
};

function FolderPageLayout({
	currentFolder,
	viewMode,
	onViewModeChange,
	filters,
	setFilters,
	onApplyFilters,
	totalItems,
	page,
	onPageChange,
}: FolderPageLayoutProps): React.ReactNode {
	return (
		<Paper h='100%' flex={1} mih={0} p='lg'>
			<Stack gap='md' h='100%'>
				<Box>
					<DriveFileTitle
						currentFolder={currentFolder}
						fallbackTitleKey='nikki.drive.myFiles'
						viewMode={viewMode}
						onViewModeChange={onViewModeChange}
						showTrashWarning={
							currentFolder?.status === DriveFileStatus.IN_TRASH ||
							currentFolder?.status === DriveFileStatus.PARENT_IN_TRASH
						}
					/>
				</Box>
				<Box>
					<DriveFileFilterBar
						value={filters}
						onChange={setFilters}
						onApply={onApplyFilters}
						enabledFields={['visibility', 'type']}
						applyOnChange={true}
					/>
				</Box>
				<Box h='100%' flex={1} mih={0}>
					<DriveFileView
						viewMode={viewMode}
						totalItems={totalItems}
						page={page}
						onPageChange={onPageChange}
					/>
				</Box>
			</Stack>
		</Paper>
	);
}

function useFolderPageCurrentFolder(currentFileId: string) {
	const dispatch = useMicroAppDispatch();

	useEffect(() => {
		if (!currentFileId) {
			(dispatch as (args: unknown) => void)(
				driveFileActions.resetCurrentFolder(),
			);
			(dispatch as (args: unknown) => void)(
				driveFileActions.resetDriveFileAncestors(),
			);
			return;
		}
		(dispatch as (args: unknown) => void)(
			driveFileActions.getCurrentFolderById(currentFileId),
		);
		(dispatch as (args: unknown) => void)(
			driveFileActions.getDriveFileAncestors(currentFileId),
		);
	}, [currentFileId, dispatch]);
}

function useFolderPageTitle(currentFolder?: import('@/features/files').DriveFile) {
	useEffect(() => {
		if (currentFolder) {
			document.title = `${currentFolder.name} - Drive - Nikki`;
		}
	}, [currentFolder]);
}

function FolderPageBody(): React.ReactNode {
	const { driveFileId } = useParams<{ driveFileId: string }>();
	const currentFileId = driveFileId ?? '';
	const dispatch = useMicroAppDispatch();

	const { page, setPage, totalItems, currentFolder } = useDriveFileList({
		mode: 'folder',
		parentId: currentFileId,
		pageSize: 20,
	});

	const VIEW_MODE_KEY = 'drive_viewMode';
	const [viewMode, setViewMode] = useLocalStorage<DriveFileUIViewMode>(
		VIEW_MODE_KEY,
		'grid',
		{
			parse: (s) => (s === 'grid' || s === 'list' ? s : 'grid'),
			serialize: (v) => v,
		},
	);

	const { filters, setFilters, handleApplyFilters } = useDriveFileFilters({
		pageSize: 20,
		baseConditions: [
			{ if: ['status', '!=', DriveFileStatus.IN_TRASH] },
		],
		onBeforeApply: () => {
			setPage(1);
		},
		onApply: (req) => {
			(dispatch as (args: unknown) => void)(
				driveFileActions.getDriveFileByParent({
					parentId: currentFileId,
					req,
				}),
			);
		},
	});

	useFolderPageCurrentFolder(currentFileId);
	useFolderPageTitle(currentFolder);

	return (
		<FolderPageLayout
			currentFolder={currentFolder}
			viewMode={viewMode}
			onViewModeChange={setViewMode}
			filters={filters}
			setFilters={setFilters}
			onApplyFilters={handleApplyFilters}
			totalItems={totalItems}
			page={page}
			onPageChange={setPage}
		/>
	);
}

export const FolderPage = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.drive.pageTitle.myFiles');
	}, [translate]);
	return <FolderPageBody />;
};
