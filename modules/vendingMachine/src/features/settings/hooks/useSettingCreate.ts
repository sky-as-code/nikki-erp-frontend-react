import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, settingActions, selectCreateSetting } from '@/appState';
import { Setting } from '@/features/settings/types';


export interface SettingCreateFormData {
	name: string;
	code?: string;
	description?: string;
	category: string;
	value: string;
	status: Setting['status'];
}

export function settingToCreateFormValues(setting: Setting): SettingCreateFormData {
	return {
		name: setting.name,
		code: setting.code,
		description: setting.description,
		category: setting.category,
		value: setting.value,
		status: setting.status,
	};
}

export function formDataToSettingUpdatePayload(
	data: SettingCreateFormData,
): Partial<Omit<Setting, 'id' | 'createdAt' | 'etag'>> {
	return {
		name: data.name,
		description: data.description,
		category: data.category,
		value: data.value,
		status: data.status,
	};
}

function buildSettingCreatePayload(data: SettingCreateFormData): Omit<Setting, 'id' | 'createdAt' | 'etag'> {
	return {
		name: data.name,
		code: data.code || `SETTING-${Date.now()}`,
		description: data.description,
		category: data.category,
		value: data.value,
		status: data.status,
	};
}

export function useSettingCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createSetting = useMicroAppSelector(selectCreateSetting);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: SettingCreateFormData) => {
		const payload = buildSettingCreatePayload(data);
		dispatch(settingActions.createSetting(payload));
	}, [dispatch]);

	const isSubmitting = createSetting.status === 'pending';

	React.useEffect(() => {
		if (createSetting.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.settings.messages.create_success', { name: createSetting.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(settingActions.resetCreateSetting());
			dispatch(settingActions.listSettings());
			const createdId = createSetting.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		}

		if (createSetting.status === 'error') {
			notification.showError(
				createSetting.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(settingActions.resetCreateSetting());
		}
	}, [createSetting, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
