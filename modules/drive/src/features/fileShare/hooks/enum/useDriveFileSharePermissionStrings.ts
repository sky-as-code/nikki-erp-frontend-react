import { useTranslation } from 'react-i18next';

import { DriveFileSharePermission } from '../../type';


export function useDriveFileSharePermissionStrings(): {
	label: (e: DriveFileSharePermission) => string;
	description: (e: DriveFileSharePermission) => string;
} {
	const { t } = useTranslation();
	const inherited = t('nikki.drive.share.permissionInParenthesesInherited');
	const ancestorFolder = t('nikki.drive.share.permissionInParenthesesAncestorOwner');

	const view = t('nikki.drive.enum.permission.view');
	const edit = t('nikki.drive.enum.permission.edit');
	const editWithTrash = t('nikki.drive.enum.permission.editWithTrash');
	const owner = t('nikki.drive.enum.permission.owner');

	const label: Record<DriveFileSharePermission, string> = {
		'view': view,
		'inherited-view': `${view} (${inherited})`,
		'edit': edit,
		'inherited-edit': `${edit} (${inherited})`,
		'edit-trash': editWithTrash,
		'inherited-edit-trash': `${editWithTrash} (${inherited})`,
		'owner': owner,
		'ancestor-owner': `${owner} (${ancestorFolder})`,
	};

	const description: Record<DriveFileSharePermission, string> = {
		'view': t('nikki.drive.enum.permission.description.view'),
		'inherited-view': t('nikki.drive.enum.permission.description.inheritedView'),
		'edit': t('nikki.drive.enum.permission.description.edit'),
		'inherited-edit': t('nikki.drive.enum.permission.description.inheritedEdit'),
		'edit-trash': t('nikki.drive.enum.permission.description.editWithTrash'),
		'inherited-edit-trash': t('nikki.drive.enum.permission.description.inheritedEditWithTrash'),
		'owner': t('nikki.drive.enum.permission.description.owner'),
		'ancestor-owner': t('nikki.drive.enum.permission.description.ancestorOwner'),
	};

	return {
		label: (e: DriveFileSharePermission) => label[e],
		description: (e: DriveFileSharePermission) => description[e],
	};
}
