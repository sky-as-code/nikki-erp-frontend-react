import { useUIState } from '@nikkierp/shell/contexts';
import { useSubmit } from '@nikkierp/ui/hooks';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskDeviceActions, selectUpdateKioskDevice } from '@/appState';
import { KioskDevice } from '@/features/kioskDevices/types';


type UpdatePayload = { id: string; etag: string; updates: Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>> };

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	onUpdateSuccess?: () => void,
) {
	const updateState = useMicroAppSelector(selectUpdateKioskDevice);

	React.useEffect(() => {
		if (updateState.status === 'success') {
			onUpdateSuccess?.();
			notification.showInfo(
				translate('nikki.vendingMachine.device.messages.update_success', { name: updateState.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskDeviceActions.resetUpdateKioskDevice());
			dispatch(kioskDeviceActions.listKioskDevices());
		}
		else if (updateState.status === 'error') {
			notification.showError(
				updateState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskDeviceActions.resetUpdateKioskDevice());
		}
	}, [updateState, dispatch, notification, translate, navigate, location]);

	return {
		isSubmitting: updateState.status === 'pending',
		handleSubmit: useSubmit<UpdatePayload>({
			submitAction: kioskDeviceActions.updateKioskDevice,
		}),
	};
}

export function useKioskDeviceEdit(kioskDevice: KioskDevice | undefined, options?: { onUpdateSuccess?: () => void }) {
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
	);

	const submit = useCallback(
		(updates: Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>>) => {
			if (kioskDevice) {
				handleSubmit({ id: kioskDevice.id, etag: kioskDevice.etag, updates });
			}
		},
		[kioskDevice?.id, kioskDevice?.etag, handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
