import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { KioskMode, KioskStatus, UIMode } from '../types';

import { VendingMachineDispatch, kioskActions, selectCreateKiosk } from '@/appState';


export type KioskCreateFormData = {
	code: string;
	name: string;
	status: KioskStatus;
	mode: KioskMode;
	uiMode: UIMode;
	locationAddress?: string | null;
	latitude?: string | null;
	longitude?: string | null;
	// ref
	modelRef: string | null;
	settingRef?: string | null;
	paymentRefs?: string[] | null;
	eventRefs?: string[] | null;
	themeRef?: string | null;
	gameRef?: string | null;
	shoppingScreenPlaylistRef?: string | null;
	waitingScreenPlaylistRef?: string | null;
};

export type KioskCreatePayload = KioskCreateFormData;


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

	const handleSubmit = useCallback((data: KioskCreatePayload) => {
		const action = dispatch(kioskActions.createKiosk(data));
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
				translate('nikki.vendingMachine.kiosk.messages.create_success'),
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
