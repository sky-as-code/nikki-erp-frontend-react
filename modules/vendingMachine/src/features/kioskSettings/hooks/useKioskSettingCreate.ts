import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskSettingActions, selectCreateKioskSetting } from '@/appState';

import { type KioskSetting } from '../types';


export interface KioskSettingCreateFormData {
	code: string;
	name: string;
	description?: string;
	status: KioskSetting['status'];
	brand?: string;
}

function buildKioskSettingCreatePayload(
	data: KioskSettingCreateFormData,
): Omit<KioskSetting, 'id' | 'createdAt' | 'etag'> {
	return {
		code: data.code,
		name: data.name,
		description: data.description,
		status: data.status,
		brand: data.brand,
		kiosks: [],
	};
}

export function useKioskSettingCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createState = useMicroAppSelector(selectCreateKioskSetting);
	const createRequestIdRef = React.useRef<string | null>(null);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: unknown) => {
		const payload = buildKioskSettingCreatePayload(data as KioskSettingCreateFormData);
		const action = dispatch(kioskSettingActions.createKioskSetting(payload));
		createRequestIdRef.current = action.requestId;
	}, [dispatch]);

	const isSubmitting = createState.status === 'pending';

	React.useEffect(() => {
		const requestId = createState.requestId;
		const matchesDispatch = requestId != null && requestId === createRequestIdRef.current;
		if (!matchesDispatch) return;

		if (createState.status === 'success') {
			createRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.kioskSettings.messages.create_success', { name: createState.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskSettingActions.resetCreateKioskSetting());
			dispatch(kioskSettingActions.listKioskSettings());
			const createdId = createState.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		}

		if (createState.status === 'error') {
			createRequestIdRef.current = null;
			notification.showError(
				createState.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskSettingActions.resetCreateKioskSetting());
		}
	}, [createState, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
