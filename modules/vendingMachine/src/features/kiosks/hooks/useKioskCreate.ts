import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskActions, selectCreateKiosk } from '@/appState';
import { Kiosk, ConnectionStatus } from '@/features/kiosks';


export interface KioskCreateFormData {
	name: string;
	code?: string;
	address: string;
	latitude?: string | number;
	longitude?: string | number;
	status: Kiosk['status'];
	mode: Kiosk['mode'];
	modelId?: string;
	paymentMethodIds?: string[];
}

export function kioskToCreateFormValues(k: Kiosk): KioskCreateFormData {
	return {
		name: k.name,
		code: k.code,
		address: k.address,
		latitude: k.coordinates.latitude.toString(),
		longitude: k.coordinates.longitude.toString(),
		status: k.status,
		mode: k.mode,
		modelId: k.modelId,
		paymentMethodIds: k.paymentMethodIds ?? [],
	};
}

export function formDataToKioskUpdatePayload(
	data: KioskCreateFormData,
): Partial<Omit<Kiosk, 'id' | 'createdAt' | 'etag'>> {
	const lat = typeof data.latitude === 'string' ? Number.parseFloat(data.latitude) : Number(data.latitude);
	const lng = typeof data.longitude === 'string' ? Number.parseFloat(data.longitude) : Number(data.longitude);
	return {
		name: data.name,
		address: data.address,
		coordinates: { latitude: lat, longitude: lng },
		mode: data.mode,
		status: data.status,
		...(data.modelId ? { modelId: data.modelId } : { modelId: undefined }),
		paymentMethodIds: data.paymentMethodIds ?? [],
	};
}

function buildKioskCreatePayload(data: KioskCreateFormData): Omit<Kiosk, 'id' | 'createdAt' | 'etag'> {
	const lat = Number(data.latitude) || 0;
	const lng = Number(data.longitude) || 0;
	return {
		name: data.name,
		code: data.code || `KIOSK-${Date.now()}`,
		address: data.address,
		coordinates: { latitude: lat, longitude: lng },
		isActive: true,
		status: data.status,
		mode: data.mode,
		connectionStatus: ConnectionStatus.DISCONNECTED,
	};
}

export function useKioskCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createKiosk = useMicroAppSelector(selectCreateKiosk);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: KioskCreateFormData) => {
		const payload = buildKioskCreatePayload(data);
		dispatch(kioskActions.createKiosk(payload));
	}, [dispatch]);

	const isSubmitting = createKiosk.status === 'pending';

	React.useEffect(() => {
		if (createKiosk.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.create_success', { name: createKiosk.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskActions.resetCreateKiosk());
			dispatch(kioskActions.listKiosks());
			const createdId = createKiosk.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		}

		if (createKiosk.status === 'error') {
			notification.showError(
				createKiosk.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskActions.resetCreateKiosk());
		}
	}, [createKiosk, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}

