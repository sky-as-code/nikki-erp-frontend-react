/* eslint-disable max-lines-per-function */
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { driveFileActions } from '@/appState/file';
import { useDriveStreamUrl } from '@/hooks/useDriveStreamUrl';
import { useOrgModulePath } from '@/hooks/useRootPath';

import { useRefreshCurrentFolder } from './useRefreshCurrentFolder';

import type { DriveFile } from '../types';

import { driveFileActions } from '@/appState/file';
import { useDriveStreamUrl } from '@/hooks/useDriveStreamUrl';
import { useOrgModulePath } from '@/hooks/useRootPath';


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
	previewFile: () => void;
};

export function useDriveFileActions(file: DriveFile): DriveFileActions {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const path = useOrgModulePath();
	const buildStreamUrl = useDriveStreamUrl();
	const { refresh } = useRefreshCurrentFolder();

	const openFolder = () => {
		if (!file.isFolder) return;
		navigate(`${path}/management/folder/${file.id}`);
	};

	const openProperties = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: t('nikki.drive.modals.info'),
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
			notifications.show({
				title: t('nikki.drive.toast.moveToTrashSuccess'),
				message: file.name,
				color: 'green',
			});
		}
		else {
			notifications.show({
				title: t('nikki.drive.toast.moveToTrashError'),
				message: file.name,
				color: 'red',
			});
		}
	};

	const restoreFromTrash = async (desFileRef?: string) => {
		const normalizedDest = desFileRef === '' ? null : desFileRef;
		const normalizedCurrentParent = file.parentDriveFileRef === '' ? null : file.parentDriveFileRef;
		const result = await (
			dispatch as (action: unknown) => Promise<{ type?: string }>
		)(driveFileActions.restoreDriveFileFromTrash({
			fileId: file.id,
			parentDriveFileRef: normalizedDest ?? normalizedCurrentParent ?? null,
		}));

		if (result?.type?.endsWith('/fulfilled')) {
			refresh({
				parentId: file.parentDriveFileRef ?? undefined,
				includeTree: true,
				treePageSize: 50,
			});
			notifications.show({
				title: t('nikki.drive.toast.restoreSuccess'),
				message: file.name,
				color: 'green',
			});
		}
		else {
			notifications.show({
				title: t('nikki.drive.toast.restoreError'),
				message: file.name,
				color: 'red',
			});
		}
	};

	const restoreTo = async () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: t('nikki.drive.modals.restoreTo'),
				type: {
					type: 'file-selector',
					afterSelectFn: (fileId: string[] | string) => {
						if (typeof fileId == 'string') restoreFromTrash(fileId);
					},
					mode: 'folder',
					multiple: false,
					action: t('nikki.drive.actions.restore'),
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
				title: t('nikki.drive.modals.update'),
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
				title: t('nikki.drive.modals.create'),
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
				title: t('nikki.drive.modals.deleteConfirm'),
				type: {
					type: 'delete-confirm',
					fileId: file.id,
					fileName: file.name,
					parentDriveFileRef: file.parentDriveFileRef ?? undefined,
				},
			}),
		);
	};

	const previewFile = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: t('nikki.drive.modals.preview'),
				type: {
					type: 'preview',
				},
			}),
		);
		(dispatch as (action: unknown) => void)(
			driveFileActions.getDriveFileById(file.id),
		);
	};

	const restoreFromTrash = async (desFileRef?: string) => {
		const result = await (
			dispatch as (action: unknown) => Promise<{ type?: string }>
		)(driveFileActions.restoreDriveFileFromTrash({
			fileId: file.id, parentDriveFileRef: desFileRef ?? file.parentDriveFileRef ?? null
		}));

		if (result?.type?.endsWith('/fulfilled')) {
			refresh({
				parentId: file.parentDriveFileRef ?? undefined,
				includeTree: true,
				treePageSize: 50,
			});
			notifications.show({
				title: t('nikki.drive.toast.restoreSuccess'),
				message: file.name,
				color: 'green',
			});
		}
		else {
			notifications.show({
				title: t('nikki.drive.toast.restoreError'),
				message: file.name,
				color: 'red',
			});
		}
	};

	const restoreTo = async () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: t('nikki.drive.modals.restoreTo'),
				type: {
					type: 'file-selector',
					afterSelectFn: (fileId: string[] | string) => {
						if (typeof fileId == 'string') restoreFromTrash(fileId);
					},
					mode: 'folder',
					multiple: false,
					action: t('nikki.drive.actions.restore'),
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
				title: t('nikki.drive.modals.update'),
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
				title: t('nikki.drive.modals.create'),
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
				title: t('nikki.drive.modals.deleteConfirm'),
				type: {
					type: 'delete-confirm',
					fileId: file.id,
					fileName: file.name,
					parentDriveFileRef: file.parentDriveFileRef ?? undefined,
				},
			}),
		);
	};

	const previewFile = () => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: t('nikki.drive.modals.preview'),
				type: {
					type: 'preview',
				},
			}),
		);
		(dispatch as (action: unknown) => void)(
			driveFileActions.getDriveFileById(file.id),
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
		previewFile,
	};
};
