import { Box, Paper, Stack, Text } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { driveFileActions, selectSearchDriveFile } from '@/appState/file';
import { DriveFileStatus } from '@/features/files';
import { DriveFileTitle } from '@/features/files/components/DriveFileTitle';
import { DriveFileView, type DriveFileUIViewMode } from '@/features/files/components/DriveFileView';
import { DriveFileFilterBar } from '@/features/files/components/filters/DriveFileFilterBar';
import { useDriveFileFilters } from '@/features/files/hooks/useDriveFileFilters';
import { useLocalStorage } from '@/features/files/hooks/useLocalStorage';


const PAGE_SIZE = 20;

type DriveSearchPageLayoutProps = {
	viewMode: DriveFileUIViewMode;
	onViewModeChange: (mode: DriveFileUIViewMode) => void;
	filters: ReturnType<typeof useDriveFileFilters>['filters'];
	setFilters: ReturnType<typeof useDriveFileFilters>['setFilters'];
	onApplyFilters: () => void;
	totalItems: number;
	page: number;
	onPageChange: (page: number) => void;
};

function DriveSearchPageLayout({
	viewMode,
	onViewModeChange,
	filters,
	setFilters,
	onApplyFilters,
	totalItems,
	page,
	onPageChange,
}: DriveSearchPageLayoutProps): React.ReactNode {
	const { t } = useTranslation();

	const hasResults = totalItems > 0;

	return (
		<Paper h='100%' flex={1} mih={0} p='lg'>
			<Stack gap='md' h='100%'>
				<Box>
					<DriveFileTitle
						fallbackTitle='Search results'
						viewMode={viewMode}
						onViewModeChange={onViewModeChange}
						showTrashWarning={false}
					/>
				</Box>
				<Box>
					<DriveFileFilterBar
						value={filters}
						onChange={setFilters}
						onApply={onApplyFilters}
						enabledFields={['status', 'visibility', 'type']}
					/>
				</Box>
				<Box h='100%' flex={1} mih={0}>
					{hasResults ? (
						<DriveFileView
							viewMode={viewMode}
							totalItems={totalItems}
							page={page}
							onPageChange={onPageChange}
							showCreateButton={false}
						/>
					) : (
						<Box
							h='100%'
							display='flex'
							style={{ alignItems: 'center', justifyContent: 'center' }}
						>
							<Text
								size='sm'
								fw={500}
								c='dimmed'
								ta='center'
							>
								{t('nikki.drive.search.emptyPrompt')}
							</Text>
						</Box>
					)}
				</Box>
			</Stack>
		</Paper>
	);
}

function DriveSearchPageBody(): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const searchState = useMicroAppSelector(selectSearchDriveFile);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [lastGraph, setLastGraph] = useState<Record<string, unknown> | null>(null);

	const q = searchParams.get('q') ?? '';

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
		pageSize: PAGE_SIZE,
		baseConditions: [
			{ if: ['status', '!=', DriveFileStatus.IN_TRASH] },
			...(q.trim()
				? [{ if: ['name', '*', q.trim()] }]
				: []),
		],
		onApply: (req) => {
			setLastGraph(req.graph);
			setPage(1);
			(dispatch as (action: unknown) => void)(
				driveFileActions.searchDriveFile({
					req: {
						...req,
						page: 0,
						size: PAGE_SIZE,
					},
				}),
			);
		},
	});

	useEffect(() => {
		setPage(1);
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetCurrentFolder(),
		);
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetDriveFileAncestors(),
		);
		(dispatch as (args: unknown) => void)(
			driveFileActions.resetSearchFile(),
		);

		const trimmed = q.trim();
		if (!trimmed) {
			// Không có query: điều hướng về My files
			navigate('../my-files', { replace: true });
			return;
		}

		handleApplyFilters();
	}, [dispatch, navigate, q]);

	useEffect(() => {
		if (!q.trim() || !lastGraph) {
			return;
		}
		if (page === 1) {
			return;
		}

		(dispatch as (action: unknown) => void)(
			driveFileActions.searchDriveFile({
				req: {
					page: page - 1,
					size: PAGE_SIZE,
					graph: lastGraph,
				},
			}),
		);
	}, [dispatch, page, q, lastGraph]);

	const totalItems = searchState.data?.total ?? 0;

	return (
		<DriveSearchPageLayout
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

export const DriveSearchPage = () => {
	const { t: translate } = useTranslation();
	const [searchParams] = useSearchParams();
	const q = searchParams.get('q') ?? '';

	useEffect(() => {
		const title = q.trim()
			? translate('nikki.drive.pageTitle.search', { query: q.trim(), defaultValue: 'Search - Drive - Nikki' })
			: translate('nikki.drive.pageTitle.search', { defaultValue: 'Search - Drive - Nikki' });
		document.title = title;
	}, [translate, q]);

	return <DriveSearchPageBody />;
};

