import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { useNavigate } from 'react-router';

import { driveFileActions } from '@/appState/file';
import { useDriveStreamUrl } from '@/hooks/useDriveStreamUrl';

import { useRefreshCurrentFolder } from './useRefreshCurrentFolder';

import type { DriveFile } from '../types';


export type DriveFileActions = {
	openFolder: () => void;
	openProperties: () => void;
	download: () => void;
	moveToTrash: () => Promise<void>;
};

export function useDriveFileActions(file: DriveFile): DriveFileActions {
	const dispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const buildStreamUrl = useDriveStreamUrl();
	const { refresh } = useRefreshCurrentFolder();

	const openFolder = () => {
		if (!file.isFolder) return;
		navigate(`../folder/${file.id}`);
	};

	const openProperties = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setOpenPropertiesCard(true),
		);
		(dispatch as (action: unknown) => void)(
			driveFileActions.getDriveFileById(file.id),
		);
	};

	const download = () => {
		if (file.isFolder) return;
		const url = buildStreamUrl(file.id, true);
		window.open(url, '_blank');
	};

	const moveToTrash = async () => {
		const result = await (dispatch as (action: unknown) => Promise<{ type?: string }>)(
			driveFileActions.moveDriveFileToTrash(file.id),
		);

		if (result?.type?.endsWith('/fulfilled')) {
			refresh({
				parentId: file.parentDriveFileRef ?? '',
				page: 0,
				size: 20,
				includeTree: true,
				treePageSize: 50,
			});
		}
	};

	return {
		openFolder,
		openProperties,
		download,
		moveToTrash,
	};
}
