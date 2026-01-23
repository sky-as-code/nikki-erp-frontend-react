import { useSubmit } from '@nikkierp/ui/hooks';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import { VendingMachineDispatch, kioskActions, selectCreateKiosk } from '@/appState';
import { Kiosk } from '@/features/kiosks';



export function useKioskCreate() {
	const navigate = useNavigate();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createKiosk = useMicroAppSelector(selectCreateKiosk);

	const handleSubmit = useSubmit<Omit<Kiosk, 'id' | 'createdAt' | 'etag'>>({
		submitAction: kioskActions.createKiosk,
	});

	const isSubmitting = createKiosk.status === 'pending';

	React.useEffect(() => {
		if (createKiosk.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.create_success', { name: createKiosk.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskActions.resetCreateKiosk());
			dispatch(kioskActions.listKiosks());
		// navigate(-1);
		}

		if (createKiosk.status === 'error') {
			notification.showError(
				createKiosk.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskActions.resetCreateKiosk());
		}
	}, [createKiosk, dispatch, notification, translate, navigate]);

	return { isSubmitting, handleSubmit };
}

