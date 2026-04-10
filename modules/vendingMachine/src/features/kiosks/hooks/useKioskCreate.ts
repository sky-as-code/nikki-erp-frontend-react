import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskActions, selectCreateKiosk } from '@/appState';
import { KioskInterfaceMode, KioskMode, KioskStatus } from '@/features/kiosks/types';

import type { CreateKioskBody, Kiosk } from '@/features/kiosks/types';


export interface KioskCreateFormData {
	name: string;
	code?: string;
	address: string;
	latitude?: string | number;
	longitude?: string | number;
	status: KioskStatus;
	mode: KioskMode;
	modelRef?: string;
	interfaceMode?: KioskInterfaceMode;
	paymentMethodIds?: string[];
}

export function kioskToCreateFormValues(k: Kiosk): KioskCreateFormData {
	return {
		name: k.name,
		code: k.code,
		address: k.locationAddress ?? '',
		latitude: k.latitude != null ? String(k.latitude) : '',
		longitude: k.longitude != null ? String(k.longitude) : '',
		status: (k.status ?? KioskStatus.ACTIVE) as KioskStatus,
		mode: (k.mode ?? KioskMode.PENDING) as KioskMode,
		modelRef: k.modelRef ?? '',
		interfaceMode: k.interfaceMode ?? KioskInterfaceMode.NORMAL,
		paymentMethodIds: [],
	};
}

export function formDataToKioskUpdatePayload(
	data: KioskCreateFormData,
	kiosk: Kiosk,
): import('@/features/kiosks/types').UpdateKioskBody {
	const lat = typeof data.latitude === 'string' ? Number.parseFloat(data.latitude) : Number(data.latitude);
	const lng = typeof data.longitude === 'string' ? Number.parseFloat(data.longitude) : Number(data.longitude);
	return {
		id: kiosk.id,
		etag: kiosk.etag,
		code: data.code,
		name: data.name,
		modelRef: data.modelRef,
		status: data.status,
		mode: data.mode,
		locationAddress: data.address,
		latitude: Number.isFinite(lat) ? lat : null,
		longitude: Number.isFinite(lng) ? lng : null,
		interfaceMode: data.interfaceMode,
	};
}

function buildKioskCreatePayload(data: KioskCreateFormData): CreateKioskBody {
	const lat = typeof data.latitude === 'string' ? Number.parseFloat(data.latitude) : Number(data.latitude);
	const lng = typeof data.longitude === 'string' ? Number.parseFloat(data.longitude) : Number(data.longitude);
	return {
		code: data.code || `KIOSK-${Date.now()}`,
		name: data.name,
		modelRef: data.modelRef || '',
		status: data.status,
		mode: data.mode,
		locationAddress: data.address,
		latitude: Number.isFinite(lat) ? lat : 0,
		longitude: Number.isFinite(lng) ? lng : 0,
		interfaceMode: data.interfaceMode ?? KioskInterfaceMode.NORMAL,
	};
}

export function useKioskCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createKiosk = useMicroAppSelector(selectCreateKiosk);
	const createRequestIdRef = React.useRef<string | null>(null);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: KioskCreateFormData) => {
		const payload = buildKioskCreatePayload(data);
		const action = dispatch(kioskActions.createKiosk(payload));
		createRequestIdRef.current = action.requestId;
	}, [dispatch]);

	const isSubmitting = createKiosk.status === 'pending';

	React.useEffect(() => {
		const requestId = createKiosk.requestId;
		const matchesDispatch = requestId != null && requestId === createRequestIdRef.current;
		if (!matchesDispatch) return;

		if (createKiosk.status === 'success') {
			createRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.create_success', { name: '' }),
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
			createRequestIdRef.current = null;
			notification.showError(
				createKiosk.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskActions.resetCreateKiosk());
		}
	}, [createKiosk, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
