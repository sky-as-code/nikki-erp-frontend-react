import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';


import { VendingMachineDispatch, kioskActions, selectDeleteKiosk } from '@/appState';
import { type Kiosk } from '@/features/kiosks';



export function useKioskDelete(onRefresh?: () => void) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteKiosk);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const confirmDelete = React.useCallback(
		(kiosk: Kiosk) => {
			dispatch(kioskActions.deleteKiosk({ id: kiosk.id }));
		},
		[dispatch],
	);

	React.useEffect(() => {
		if (deleteState.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskActions.resetDeleteKiosk());
			onRefresh?.();
		}
		else if (deleteState.status === 'error') {
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskActions.resetDeleteKiosk());
		}
	}, [deleteState, dispatch, notification, translate, onRefresh]);

	return confirmDelete;
}

