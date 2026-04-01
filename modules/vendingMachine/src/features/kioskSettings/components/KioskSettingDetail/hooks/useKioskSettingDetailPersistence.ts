import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskSettingActions } from '@/appState';

import { KioskSetting } from '../../../types';

import type { KioskSettingUpdatePayload } from './types';


export function useKioskSettingDetailPersistence(setting: KioskSetting | undefined) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const navigate = useNavigate();

	const refreshDetail = useCallback(() => {
		if (setting?.id) {
			dispatch(kioskSettingActions.getKioskSetting(setting.id));
		}
	}, [dispatch, setting?.id]);

	const onSaveSettings = useCallback(async (updates: KioskSettingUpdatePayload) => {
		if (!setting) return;
		await dispatch(kioskSettingActions.updateKioskSetting({
			id: setting.id,
			etag: setting.etag,
			updates,
		})).unwrap();
		refreshDetail();
	}, [dispatch, setting, refreshDetail]);

	const onDelete = useCallback(async () => {
		if (!setting) return;
		await dispatch(kioskSettingActions.deleteKioskSetting({ id: setting.id })).unwrap();
		navigate('../kiosk-settings');
	}, [dispatch, navigate, setting]);

	return {
		onSaveSettings,
		onDelete,
	};
}
