import {
	Group,
	Loader,
	Modal,
	Stack,
	Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessDetailModalBody } from './DriveFileShareAccessDetailModalBody';

import type {
	DriveFileShare,
	DriveFileSharePermission as DriveFileSharePermissionType,
} from '@/features/fileShare/type';

import {
	driveFileShareActions,
	selectDriveFileShareSharesByUserState,
} from '@/appState/fileShare';
import { DriveUserDisplay } from '@/components';
import { DriveFileSharePermissionDisplay, fileShareService } from '@/features/fileShare';
import { isDirectPermission, orderSharesForAccessDetail } from '@/features/fileShare/driveFileShareAccessDetailUtils';
import { resolveUserRef } from '@/features/fileShare/driveFileShareUserUtils';


function SharesByUserStatusFeedback({ status, error, t }: {
	status: string;
	error?: string | null;
	t: (key: string) => string;
}): React.ReactNode {
	if (status === 'pending') {
		return <Group justify='center' py='md'><Loader size='sm' /></Group>;
	}
	if (status === 'error') {
		return <Text size='sm' c='red'>{error ?? t('nikki.general.messages.error')}</Text>;
	}
	return null;
}

function useRefreshAfterUpdate(fileId: string, userId: string) {
	const dispatch = useMicroAppDispatch();
	return React.useCallback(() => {
		if (!userId) return;
		(dispatch as (action: unknown) => void)(
			driveFileShareActions.getFileSharesByUser({ fileId, userId }),
		);
		(dispatch as (action: unknown) => void)(
			driveFileShareActions.getResolvedFileShares({ fileId, params: { page: 0, size: 50 } }),
		);
	}, [dispatch, fileId, userId]);
}

function useShareMutations(fileId: string, refresh: () => void) {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();

	const showError = React.useCallback(() => {
		notifications.show({
			title: t('nikki.general.messages.error'),
			message: t('nikki.general.errors.update_failed'),
			color: 'red',
		});
	}, [t]);

	const handleCreate = React.useCallback(async (
		userRef: string, permission: DriveFileSharePermissionType,
	) => {
		try {
			await fileShareService.createFileShare(fileId, { driveFileRef: fileId, userRef, permission });
			refresh();
		}
		catch { showError(); }
	}, [fileId, refresh, showError]);

	const handleRevoke = React.useCallback(async (share: DriveFileShare) => {
		try {
			await (dispatch as (action: unknown) => Promise<{ type?: string }>)(
				driveFileShareActions.deleteFileShare({ fileId, shareId: share.id }),
			);
			refresh();
		}
		catch { showError(); }
	}, [dispatch, fileId, refresh, showError]);

	return { handleCreate, handleRevoke };
}

export type DriveFileShareAccessDetailModalProps = {
	fileId: string;
	opened: boolean;
	anchorShare: DriveFileShare | null;
	onClose: () => void;
	permissionOptions: Array<{ value: DriveFileSharePermissionType; label: string }>;
	onPermissionChange: (
		share: DriveFileShare,
		nextPermission: DriveFileSharePermissionType,
	) => Promise<boolean>;
	onNavigateAway?: () => void;
};

export function DriveFileShareAccessDetailModal({
	fileId, opened, anchorShare, onClose, permissionOptions, onPermissionChange, onNavigateAway,
}: DriveFileShareAccessDetailModalProps): React.ReactNode {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	const sharesByUserState = useMicroAppSelector(selectDriveFileShareSharesByUserState);
	const rawItems = sharesByUserState.data ?? [];
	const orderedItems = React.useMemo(
		() => orderSharesForAccessDetail(rawItems, fileId), [fileId, rawItems],
	);
	const currentRow = orderedItems[0] ?? null;
	const restRows = orderedItems.slice(1);
	const isDirect = currentRow ? isDirectPermission(currentRow.permission) : false;
	const userId = anchorShare ? resolveUserRef(anchorShare) : '';
	const refresh = useRefreshAfterUpdate(fileId, userId);
	const { handleCreate, handleRevoke } = useShareMutations(fileId, refresh);

	React.useEffect(() => {
		if (!opened || !userId) return;
		(dispatch as (action: unknown) => void)(driveFileShareActions.getFileSharesByUser({ fileId, userId }));
	}, [dispatch, fileId, opened, userId]);

	React.useEffect(() => {
		if (!opened) (dispatch as (action: unknown) => void)(driveFileShareActions.resetSharesByUser());
	}, [dispatch, opened]);

	const handleUpdate = async (row: DriveFileShare, next: DriveFileSharePermissionType) => {
		const ok = await onPermissionChange(row, next);
		if (ok) refresh();
	};

	if (!anchorShare) return null;

	return (
		<Modal opened={opened} onClose={onClose} title={t('nikki.drive.share.accessDetailTitle')} size='md' centered>
			<Stack gap='lg'>
				<Group justify='space-between' align='center' wrap='nowrap'>
					<DriveUserDisplay
						displayName={anchorShare.user?.displayName ?? resolveUserRef(anchorShare) ?? '-'}
						email={anchorShare.user?.email}
						avatarUrl={anchorShare.user?.avatarUrl ?? null}
						avatarSize={40}
					/>
					{currentRow ? <DriveFileSharePermissionDisplay e={currentRow.permission} /> : null}
				</Group>
				<SharesByUserStatusFeedback status={sharesByUserState.status} error={sharesByUserState.error} t={t} />
				{sharesByUserState.status === 'success' && !currentRow ? (
					<Text size='sm' c='dimmed'>{t('nikki.drive.share.accessDetailUserSharesEmpty')}</Text>
				) : null}
				{sharesByUserState.status === 'success' && currentRow ? (
					<DriveFileShareAccessDetailModalBody
						fileId={fileId}
						currentRow={currentRow}
						restRows={restRows}
						isDirectPermission={isDirect}
						permissionOptions={permissionOptions}
						onUpdatePermission={handleUpdate}
						onCreatePermission={handleCreate}
						onRevokePermission={handleRevoke}
						onClose={onNavigateAway ?? onClose}
					/>
				) : null}
			</Stack>
		</Modal>
	);
}
