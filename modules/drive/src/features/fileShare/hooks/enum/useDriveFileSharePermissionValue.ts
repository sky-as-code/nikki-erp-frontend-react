import { useTranslation } from 'react-i18next';

import { DriveFileSharePermission } from '../../type';


export function useDriveFileSharePermissionValue(): (e: DriveFileSharePermission) => string {
	const { t } = useTranslation();
	const inherited = t('nikki.drive.share.permissionInParenthesesInherited');
	const ancestorFolder = t('nikki.drive.share.permissionInParenthesesAncestorOwner');

	const view = t('nikki.drive.enum.permission.view');
	const edit = t('nikki.drive.enum.permission.edit');
	const editWithTrash = t('nikki.drive.enum.permission.editWithTrash');
	const owner = t('nikki.drive.enum.permission.owner');

	const value: Record<DriveFileSharePermission, string> = {
		'view': view,
		'inherited-view': `${view} (${inherited})`,
		'edit': edit,
		'inherited-edit': `${edit} (${inherited})`,
		'edit-trash': editWithTrash,
		'inherited-edit-trash': `${editWithTrash} (${inherited})`,
		'owner': owner,
		'ancestor-owner': `${owner} (${ancestorFolder})`,
	};

	return (e: DriveFileSharePermission) => value[e];
}
