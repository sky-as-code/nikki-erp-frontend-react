import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { KioskSetting } from '../types';

import { VendingMachineDispatch, kioskSettingActions, selectUpdateKioskSetting } from '@/appState';



export type KioskSettingBasicInfoFormData = {
	name: string;
	description?: string;
	status: KioskSetting['status'];
	brand?: string;
};

/** Giá trị form khớp `kioskSettingSchema` (field ẩn vẫn cần cho ModelSchema). */
export function kioskSettingToFormModelValues(setting: KioskSetting) {
	return {
		id: setting.id,
		code: setting.code,
		name: setting.name,
		description: setting.description ?? '',
		status: setting.status,
		brand: setting.brand ?? '',
		createdAt: setting.createdAt,
	};
}

export function formDataToKioskSettingBasicInfoUpdates(
	data: KioskSettingBasicInfoFormData,
): Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>> {
	return {
		name: data.name,
		description: data.description,
		status: data.status,
		brand: data.brand,
	};
}

function useSubmitHandler(
	setting: KioskSetting | undefined,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	onUpdateSuccess?: () => void,
) {
	const updateKioskSetting = useMicroAppSelector(selectUpdateKioskSetting);
	const updateRequestIdRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		const requestId = updateKioskSetting.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateKioskSetting.status === 'success') {
			updateRequestIdRef.current = null;
			onUpdateSuccess?.();
			notification.showInfo(
				translate('nikki.vendingMachine.kioskSettings.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskSettingActions.resetUpdateKioskSetting());
		}
		else if (updateKioskSetting.status === 'error') {
			updateRequestIdRef.current = null;
			notification.showError(
				updateKioskSetting.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskSettingActions.resetUpdateKioskSetting());
		}
	}, [updateKioskSetting, dispatch, notification, translate, navigate, location]);

	return {
		isSubmitting: updateKioskSetting.status === 'pending',
		handleSubmit: (payload: { id: string; etag: string; updates: Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>> }) => {
			const action = dispatch(kioskSettingActions.updateKioskSetting(payload));
			updateRequestIdRef.current = action.requestId;
		},
	};
}

export function useKioskSettingEdit(setting: KioskSetting | undefined, options?: { onUpdateSuccess?: () => void }) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();

	const { isSubmitting, handleSubmit } = useSubmitHandler(
		setting,
		dispatch,
		notification,
		translate,
		navigate,
		location,
		options?.onUpdateSuccess,
	);

	return {
		isSubmitting,
		handleSubmit: (updates: Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>>) => {
			if (setting) {
				handleSubmit({ id: setting.id, etag: setting.etag, updates });
			}
		},
	};
}
