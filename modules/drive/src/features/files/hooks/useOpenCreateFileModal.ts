import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { useTranslation } from 'react-i18next';

import { driveFileActions } from '@/appState/file';


export function useOpenCreateFileModal(): (defaultIsFolder?: boolean) => void {
	const dispatch = useMicroAppDispatch();
	const { t } = useTranslation();

	return (defaultIsFolder?: boolean) => {
		(dispatch as (action: unknown) => void)(
			driveFileActions.setDriveFileModal({
				openedModal: true,
				title: t('nikki.drive.modals.create'),
				type: {
					type: 'create',
					defaultIsFolder,
				},
			}),
		);
	};
}
