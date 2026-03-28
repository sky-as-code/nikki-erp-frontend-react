import React from 'react';

import { useDriveFileSharePermissionStrings } from '@/features/fileShare/hooks/enum/useDriveFileSharePermissionStrings';
import { DriveFileSharePermission } from '@/features/fileShare/type';



export function useSharePermissionOptions(): Array<{ value: DriveFileSharePermission; label: string }> {
	const { label: permissionLabel } = useDriveFileSharePermissionStrings();
	return React.useMemo(() => {
		return [
			{ value: DriveFileSharePermission.VIEW, label: permissionLabel(DriveFileSharePermission.VIEW) },
			{ value: DriveFileSharePermission.EDIT, label: permissionLabel(DriveFileSharePermission.EDIT) },
			{ value: DriveFileSharePermission.EDIT_TRASH, label: permissionLabel(DriveFileSharePermission.EDIT_TRASH) },
			{
				value: DriveFileSharePermission.INHERITED_VIEW,
				label: permissionLabel(DriveFileSharePermission.INHERITED_VIEW),
			},
			{
				value: DriveFileSharePermission.INHERITED_EDIT,
				label: permissionLabel(DriveFileSharePermission.INHERITED_EDIT),
			},
			{
				value: DriveFileSharePermission.INHERITED_EDIT_TRASH,
				label: permissionLabel(DriveFileSharePermission.INHERITED_EDIT_TRASH),
			},
			{
				value: DriveFileSharePermission.ANCESTOR_OWNER,
				label: permissionLabel(DriveFileSharePermission.ANCESTOR_OWNER),
			},
			{ value: DriveFileSharePermission.OWNER, label: permissionLabel(DriveFileSharePermission.OWNER) },
		];
	}, [permissionLabel]);
}
