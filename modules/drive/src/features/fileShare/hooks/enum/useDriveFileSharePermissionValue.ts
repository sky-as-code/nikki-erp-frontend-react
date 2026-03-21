import { useTranslation } from 'react-i18next';

import { DriveFileSharePermission } from '../../type';


export function useDriveFileSharePermissionValue(): (e: DriveFileSharePermission) => string {
	const {t} = useTranslation();
	const value: Record<DriveFileSharePermission, string> = {
		'view': t('nikki.drive.enum.permission.view'),
		'edit': t('nikki.drive.enum.permission.edit'),
		'edit-trash': t('nikki.drive.enum.permission.editWithTrash'),
	};

	return (e: DriveFileSharePermission) => {
		return value[e];
	};
}
