import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskDeviceActions, selectCreateKioskDevice } from '@/appState';
import { KioskDevice } from '@/features/kioskDevices/types';


export interface KioskDeviceCreateFormData {
	name: string;
	code?: string;
	description?: string;
	status: KioskDevice['status'];
	deviceType?: KioskDevice['deviceType'];
}

export function kioskDeviceToCreateFormValues(device: KioskDevice): KioskDeviceCreateFormData {
	return {
		name: device.name,
		code: device.code,
		description: device.description,
		status: device.status,
		deviceType: device.deviceType,
	};
}

export function formDataToKioskDeviceUpdatePayload(
	data: KioskDeviceCreateFormData,
): Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>> {
	return {
		name: data.name,
		description: data.description,
		status: data.status,
		deviceType: data.deviceType,
	};
}

function buildKioskDeviceCreatePayload(data: KioskDeviceCreateFormData): Omit<KioskDevice, 'id' | 'createdAt' | 'etag'> {
	return {
		name: data.name,
		code: data.code || `KIOSK-DEVICE-${Date.now()}`,
		description: data.description,
		status: data.status,
		deviceType: data.deviceType,
		specifications: [],
	};
}

export function useKioskDeviceCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createKioskDevice = useMicroAppSelector(selectCreateKioskDevice);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: KioskDeviceCreateFormData) => {
		const payload = buildKioskDeviceCreatePayload(data);
		dispatch(kioskDeviceActions.createKioskDevice(payload));
	}, [dispatch]);

	const isSubmitting = createKioskDevice.status === 'pending';

	React.useEffect(() => {
		if (createKioskDevice.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.device.messages.create_success', { name: createKioskDevice.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskDeviceActions.resetCreateKioskDevice());
			dispatch(kioskDeviceActions.listKioskDevices());
			const createdId = createKioskDevice.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		}

		if (createKioskDevice.status === 'error') {
			notification.showError(
				createKioskDevice.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskDeviceActions.resetCreateKioskDevice());
		}
	}, [createKioskDevice, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
