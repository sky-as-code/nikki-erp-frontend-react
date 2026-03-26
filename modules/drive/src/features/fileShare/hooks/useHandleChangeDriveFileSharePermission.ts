import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { DriveFileShare, DriveFileSharePermission as DriveFileSharePermissionType } from '@/features/fileShare/type';

import { driveFileShareActions } from '@/appState/fileShare';


export function useHandleChangeDriveFileSharePermission(fileId: string) {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	return React.useCallback(async (
		share: DriveFileShare,
		nextPermission: string | null,
	): Promise<boolean> => {
		if (!nextPermission || nextPermission === share.permission) return true;
		const result = await (dispatch as (action: unknown) => Promise<{ type?: string }>)(
			driveFileShareActions.updateFileShare({
				fileId: fileId,
				shareId: share.id,
				req: { etag: share.etag, permission: nextPermission as DriveFileSharePermissionType },
			}),
		);
		if (!result?.type?.endsWith('/fulfilled')) {
			notifications.show({
				title: t('nikki.general.messages.error'),
				message: t('nikki.general.errors.update_failed'),
				color: 'red',
			});
			return false;
		}
		return true;
	}, [dispatch, fileId, t]);
}
