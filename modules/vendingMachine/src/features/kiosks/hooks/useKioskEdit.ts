import { useSubmit } from '@nikkierp/ui/hooks';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import { VendingMachineDispatch, kioskActions, selectUpdateKiosk } from '@/appState';
import { Kiosk } from '@/features/kiosks';


function useSubmitHandler(
	kiosk: Kiosk | undefined,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	const updateKiosk = useMicroAppSelector(selectUpdateKiosk);

	React.useEffect(() => {
		if (updateKiosk.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.update_success', { name: updateKiosk.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskActions.resetUpdateKiosk());
			dispatch(kioskActions.listKiosks());
			// navigate(-1);
		}
		else if (updateKiosk.status === 'error') {
			notification.showError(
				updateKiosk.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskActions.resetUpdateKiosk());
		}
	}, [updateKiosk, dispatch, notification, translate, navigate, location]);

	return {
		isSubmitting: updateKiosk.status === 'pending',
		handleSubmit: useSubmit<{ id: string; etag: string; updates: Partial<Omit<Kiosk, 'id' | 'createdAt' | 'etag'>> }>({
			submitAction: kioskActions.updateKiosk,
		}),
	};
}

export function useKioskEdit(kiosk: Kiosk | undefined) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();

	const { isSubmitting, handleSubmit } = useSubmitHandler(
		kiosk,
		dispatch,
		notification,
		translate,
		navigate,
		location,
	);

	return {
		isSubmitting,
		handleSubmit: (updates: Partial<Omit<Kiosk, 'id' | 'createdAt' | 'etag'>>) => {
			if (kiosk) {
				handleSubmit({ id: kiosk.id, etag: kiosk.etag, updates });
			}
		},
	};
}

