import { useTranslation } from 'react-i18next';

import { DriveFileVisibility } from '../../types';


export function useDriveFileVisibilityValue(): (e: DriveFileVisibility) => string {
	const {t} = useTranslation();
	const value: Record<DriveFileVisibility, string> = {
		'owner': t('nikki.drive.enum.visibility.owner'),
		'public': t('nikki.drive.enum.visibility.public'),
		'shared': t('nikki.drive.enum.visibility.shared'),
	};

	return (e: DriveFileVisibility) => {
		return value[e];
	};
}
