import { useTranslation } from 'react-i18next';

import { DriveFileType } from '../../types';


export function useDriveFileTypeValue(): (e: DriveFileType) => string {
	const { t } = useTranslation();
	const value: Record<DriveFileType, string> = {
		folder: t('nikki.drive.enum.type.folder'),
		image: t('nikki.drive.enum.type.image'),
		video: t('nikki.drive.enum.type.video'),
		audio: t('nikki.drive.enum.type.audio'),
		document: t('nikki.drive.enum.type.document'),
		spreadsheet: t('nikki.drive.enum.type.spreadsheet'),
		presentation: t('nikki.drive.enum.type.presentation'),
		pdf: t('nikki.drive.enum.type.pdf'),
		text: t('nikki.drive.enum.type.text'),
		code: t('nikki.drive.enum.type.code'),
		archive: t('nikki.drive.enum.type.archive'),
		other: t('nikki.drive.enum.type.other'),
	};

	return (e: DriveFileType) => {
		return value[e];
	};
}
