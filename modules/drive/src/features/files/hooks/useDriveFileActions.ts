/* eslint-disable max-lines-per-function */
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { useNavigate } from 'react-router';

import { driveFileActions } from '@/appState/file';
import { useDriveStreamUrl } from '@/hooks/useDriveStreamUrl';

import { useRefreshCurrentFolder } from './useRefreshCurrentFolder';


import type { DriveFile } from '../types';



export type DriveFileActions = {
	openFolder: () => void;
	openProperties: () => void;
	editMetadata: () => void;
	create: () => void;
	download: () => void;
	moveToTrash: () => Promise<void>;
	restoreFromTrash: (desFileRef?: string) => Promise<void>;
	restoreTo: () => Promise<void>;
	confirmDelete: () => void;
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
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: 'Properties',
				type: {
					type: 'properties',
				},
			}),
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
		const result = await (
			dispatch as (action: unknown) => Promise<{ type?: string }>
		)(driveFileActions.moveDriveFileToTrash(file.id));

		if (result?.type?.endsWith('/fulfilled')) {
			refresh({
				parentId: file.parentDriveFileRef ?? undefined,
				includeTree: true,
				treePageSize: 50,
			});
		}
	};

	const restoreFromTrash = async (desFileRef?: string) => {
		const result = await (
			dispatch as (action: unknown) => Promise<{ type?: string }>
		)(driveFileActions.restoreDriveFileFromTrash({
			fileId: file.id, parentDriveFileRef: desFileRef ?? file.parentDriveFileRef ?? null }));

		if (result?.type?.endsWith('/fulfilled')) {
			refresh({
				parentId: file.parentDriveFileRef ?? undefined,
				includeTree: true,
				treePageSize: 50,
			});
		}
	};

	const restoreTo = async () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: 'Restore To',
				type: {
					type: 'file-selector',
					afterSelectFn: (fileId: string[] | string) => {
						if (typeof fileId == 'string') restoreFromTrash(fileId);
					},
					mode: 'folder',
					multiple: false,
					action: 'Restore',
				},
			}),
		);
	};


	const editMetadata = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.getDriveFileById(file.id),
		);
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: 'Update',
				type: {
					type: 'update',
				},
			}),
		);
	};

	const create = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: 'Create',
				type: {
					type: 'create',
				},
			}),
		);
	};

	const confirmDelete = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: 'Delete file',
				type: {
					type: 'delete-confirm',
					fileId: file.id,
					fileName: file.name,
					parentDriveFileRef: file.parentDriveFileRef ?? undefined,
				},
			}),
		);
	};

	return {
		openFolder,
		openProperties,
		download,
		moveToTrash,
		restoreFromTrash,
		restoreTo,
		editMetadata,
		create,
		confirmDelete,
	};
};
