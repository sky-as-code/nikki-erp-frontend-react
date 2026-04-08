import { useUIState } from '@nikkierp/shell/contexts';
import { useSubmit } from '@nikkierp/ui/hooks';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskActions, selectUpdateKiosk } from '@/appState';

import type { Kiosk, UpdateKioskBody } from '@/features/kiosks/types';


type UpdatePayload = { id: string; body: UpdateKioskBody };

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	onUpdateSuccess?: () => void,
	kioskId?: string,
) {
	const updateKiosk = useMicroAppSelector(selectUpdateKiosk);

	React.useEffect(() => {
		if (updateKiosk.status === 'success') {
			onUpdateSuccess?.();
			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.update_success', { name: '' }),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskActions.resetUpdateKiosk());
			dispatch(kioskActions.listKiosks());
			if (kioskId) {
				dispatch(kioskActions.getKiosk(kioskId));
			}
		}
		else if (updateKiosk.status === 'error') {
			notification.showError(
				updateKiosk.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskActions.resetUpdateKiosk());
		}
	}, [updateKiosk, dispatch, notification, translate, navigate, location, onUpdateSuccess, kioskId]);

	return {
		isSubmitting: updateKiosk.status === 'pending',
		handleSubmit: useSubmit<UpdatePayload>({
			submitAction: kioskActions.updateKiosk,
		}),
	};
}

export function useKioskEdit(kiosk: Kiosk | undefined, options?: { onUpdateSuccess?: () => void }) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();

	const { isSubmitting, handleSubmit } = useSubmitHandler(
		dispatch,
		notification,
		translate,
		navigate,
		location,
		options?.onUpdateSuccess,
		kiosk?.id,
	);

	const submit = useCallback(
		(body: UpdateKioskBody) => {
			if (kiosk) {
				handleSubmit({ id: kiosk.id, body });
			}
		},
		[kiosk?.id, kiosk, handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
