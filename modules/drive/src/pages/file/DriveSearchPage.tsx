import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { driveFileActions, selectSearchDriveFile } from '@/appState/file';
import { DriveFileStatus } from '@/features/files';
import { DriveFileView } from '@/features/files/components/DriveFileView';


const PAGE_SIZE = 20;

function DriveSearchPageBody(): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const searchState = useMicroAppSelector(selectSearchDriveFile);
	const [searchParams] = useSearchParams();
	const [page, setPage] = useState(1);

	const q = searchParams.get('q') ?? '';

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
	}, [dispatch, q]);

	useEffect(() => {
		if (!q.trim()) {
			return;
		}
		(dispatch as (action: unknown) => void)(
			driveFileActions.searchDriveFile({
				req: {
					page: page - 1,
					size: PAGE_SIZE,
					graph: {
						and: [
							{ if: ['status', '!=', DriveFileStatus.IN_TRASH] },
							{ if: ['name', '*', q.trim()] },
						],
					},
				},
			}),
		);
	}, [dispatch, page, q]);

	const totalItems = searchState.data?.total ?? 0;

	return (
		<DriveFileView
			currentFolder={undefined}
			totalItems={totalItems}
			page={page}
			onPageChange={setPage}
			fallbackTitle='Search results'
			initialViewMode='list'
			showTrashWarning={false}
			showCreateButton={false}
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

