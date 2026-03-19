import { useTranslation } from 'react-i18next';

import { DriveFileStatus } from '../../types';


export function useDriveFileStatusValue(): (e: DriveFileStatus) => string {
	const {t} = useTranslation();
	const value: Record<DriveFileStatus, string> = {
		'active': t('nikki.drive.enum.status.active'),
		'in-trash': t('nikki.drive.enum.status.inTrash'),
		'parent-in-trash': t('nikki.drive.enum.status.parentInTrash'),
	};

	return (e: DriveFileStatus) => {
		return value[e];
	};
}
