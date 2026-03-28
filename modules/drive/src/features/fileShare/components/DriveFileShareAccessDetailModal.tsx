import {
	Group,
	Loader,
	Modal,
	Stack,
	Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileShareAccessDetailModalBody } from './DriveFileShareAccessDetailModalBody';

import type {
	DriveFileShare,
	DriveFileSharePermission as DriveFileSharePermissionType,
} from '@/features/fileShare/type';

import {
	driveFileShareActions,
} from '@/appState/fileShare';
import { DriveUserDisplay } from '@/components';
import { DriveFileSharePermissionDisplay, fileShareService } from '@/features/fileShare';
import { isDirectPermission } from '@/features/fileShare/driveFileShareAccessDetailUtils';
import { resolveUserRef } from '@/features/fileShare/driveFileShareUserUtils';
import { useDriveFileSharesByUser } from '@/features/fileShare/hooks/useDriveFileSharesByUser';


function SharesByUserStatusFeedback({ status, error, t }: {
	status: string;
	error?: string | null;
	t: (key: string) => string;
}): React.ReactNode {
	if (status === 'pending' || status === 'idle') {
		return <Group justify='center' py='md'><Loader size='sm' /></Group>;
	}
	if (status === 'error') {
		return <Text size='sm' c='red'>{error ?? t('nikki.general.messages.error')}</Text>;
	}
	return null;
}

function useShareMutations(fileId: string, refresh: () => Promise<void>) {
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
			await refresh();
		}
		catch { showError(); }
	}, [fileId, refresh, showError]);

	const handleRevoke = React.useCallback(async (share: DriveFileShare) => {
		try {
			await (dispatch as (action: unknown) => Promise<{ type?: string }>)(
				driveFileShareActions.deleteFileShare({ fileId, shareId: share.id }),
			);
			await refresh();
		}
		catch { showError(); }
	}, [dispatch, fileId, refresh, showError]);

	return { handleCreate, handleRevoke };
}

export type DriveFileShareAccessDetailModalProps = {
	fileId: string;
	opened: boolean;
	anchorShare: DriveFileShare | null;
	/** Chỉ chủ file hoặc chủ folder cha (ANCESTOR_OWNER) mới được cập nhật / thu hồi trong form. */
	canManageShare: boolean;
	onClose: () => void;
	permissionOptions: Array<{ value: DriveFileSharePermissionType; label: string }>;
	onPermissionChange: (
		share: DriveFileShare,
		nextPermission: DriveFileSharePermissionType,
	) => Promise<boolean>;
	onNavigateAway?: () => void;
	/** Gọi sau khi refetch chi tiết user + resolved; truyền `userId` của user đang xem trong modal. */
	onAccessUpdated?: (userId: string) => void;
};

export function DriveFileShareAccessDetailModal({
	fileId, opened, anchorShare, canManageShare, onClose, permissionOptions, onPermissionChange, onNavigateAway,
	onAccessUpdated,
}: DriveFileShareAccessDetailModalProps): React.ReactNode {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	const userId = anchorShare ? resolveUserRef(anchorShare) : '';

	const {
		status: sharesStatus,
		error: sharesError,
		appliedShare: currentRow,
		inheritedChainShares: restRows,
		refetch: refetchSharesByUser,
	} = useDriveFileSharesByUser({
		fileId,
		userId,
		enabled: opened && Boolean(userId),
	});

	const isDirect = currentRow ? isDirectPermission(currentRow.permission) : false;

	const refresh = React.useCallback(async () => {
		await refetchSharesByUser();
		(dispatch as (action: unknown) => void)(
			driveFileShareActions.getResolvedFileShares({ fileId, params: { page: 0, size: 50 } }),
		);
		if (userId) onAccessUpdated?.(userId);
	}, [dispatch, fileId, onAccessUpdated, refetchSharesByUser, userId]);

	const { handleCreate, handleRevoke } = useShareMutations(fileId, refresh);

	const handleUpdate = async (row: DriveFileShare, next: DriveFileSharePermissionType) => {
		const ok = await onPermissionChange(row, next);
		if (ok) await refresh();
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
				<SharesByUserStatusFeedback status={sharesStatus} error={sharesError} t={t} />
				{sharesStatus === 'success' && !currentRow ? (
					<Text size='sm' c='dimmed'>{t('nikki.drive.share.accessDetailUserSharesEmpty')}</Text>
				) : null}
				{sharesStatus === 'success' && currentRow ? (
					<DriveFileShareAccessDetailModalBody
						fileId={fileId}
						subjectUserRef={userId}
						currentRow={currentRow}
						restRows={restRows}
						isDirectPermission={isDirect}
						canManageShare={canManageShare}
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
