import { useTranslation } from 'react-i18next';

import { DriveFileSharePermission } from '../../type';


export function useDriveFileSharePermissionDescription(): (e: DriveFileSharePermission) => string {
	const { t } = useTranslation();
	const value: Record<DriveFileSharePermission, string> = {
		'view': t('nikki.drive.enum.permission.description.view'),
		'inherited-view': t('nikki.drive.enum.permission.description.inheritedView'),
		'edit': t('nikki.drive.enum.permission.description.edit'),
		'inherited-edit': t('nikki.drive.enum.permission.description.inheritedEdit'),
		'edit-trash': t('nikki.drive.enum.permission.description.editWithTrash'),
		'inherited-edit-trash': t('nikki.drive.enum.permission.description.inheritedEditWithTrash'),
		'owner': t('nikki.drive.enum.permission.description.owner'),
		'ancestor-owner': t('nikki.drive.enum.permission.description.ancestorOwner'),
	};

	return (e: DriveFileSharePermission) => value[e];
}
