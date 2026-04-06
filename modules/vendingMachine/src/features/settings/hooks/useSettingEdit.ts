import { useUIState } from '@nikkierp/shell/contexts';
import { useSubmit } from '@nikkierp/ui/hooks';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, settingActions, selectUpdateSetting } from '@/appState';
import { Setting } from '@/features/settings/types';


type UpdatePayload = { id: string; etag: string; updates: Partial<Omit<Setting, 'id' | 'createdAt' | 'etag'>> };

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	onUpdateSuccess?: () => void,
) {
	const updateState = useMicroAppSelector(selectUpdateSetting);

	React.useEffect(() => {
		if (updateState.status === 'success') {
			onUpdateSuccess?.();
			notification.showInfo(
				translate('nikki.vendingMachine.settings.messages.update_success', { name: updateState.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(settingActions.resetUpdateSetting());
			dispatch(settingActions.listSettings());
		}
		else if (updateState.status === 'error') {
			notification.showError(
				updateState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(settingActions.resetUpdateSetting());
		}
	}, [updateState, dispatch, notification, translate, navigate, location]);

	return {
		isSubmitting: updateState.status === 'pending',
		handleSubmit: useSubmit<UpdatePayload>({
			submitAction: settingActions.updateSetting,
		}),
	};
}

export function useSettingEdit(setting: Setting | undefined, options?: { onUpdateSuccess?: () => void }) {
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
		(updates: Partial<Omit<Setting, 'id' | 'createdAt' | 'etag'>>) => {
			if (setting) {
				handleSubmit({ id: setting.id, etag: setting.etag, updates });
			}
		},
		[setting?.id, setting?.etag, handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
