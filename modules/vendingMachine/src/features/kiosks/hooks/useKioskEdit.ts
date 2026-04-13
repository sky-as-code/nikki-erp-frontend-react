import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskActions, selectUpdateKiosk } from '@/appState';

import type { Kiosk } from '@/features/kiosks/types';



export type KioskUpdateFormData = {id: string; etag: string;} & Pick<
	Partial<Kiosk>,
	| 'code'
	| 'name'
	| 'status'
	| 'mode'
	| 'uiMode'
	| 'locationAddress'
	| 'latitude'
	| 'longitude'
	| 'modelRef'
	| 'settingRef'
	| 'paymentRefs'
	| 'eventRefs'
	| 'themeRef'
	| 'gameRef'
	| 'shoppingScreenPlaylistRef'
	| 'waitingScreenPlaylistRef'
>;

export type KioskUpdatePayload = { id: string; body: KioskUpdateFormData };

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	onUpdateSuccess?: () => void,
) {
	const updateKiosk = useMicroAppSelector(selectUpdateKiosk);
	const updateRequestIdRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		const requestId = updateKiosk.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateKiosk.status === 'success') {
			updateRequestIdRef.current = null;
			dispatch(kioskActions.resetUpdateKiosk());
			onUpdateSuccess?.();

			notification.showInfo(
				translate('nikki.vendingMachine.kiosk.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
		}
		else if (updateKiosk.status === 'error') {
			updateRequestIdRef.current = null;
			dispatch(kioskActions.resetUpdateKiosk());

			notification.showError(
				updateKiosk.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
		}
	}, [updateKiosk, dispatch, notification, translate, navigate, location, onUpdateSuccess]);

	const handleSubmit = useCallback((payload: KioskUpdatePayload) => {
		const action = dispatch(kioskActions.updateKiosk(payload));
		updateRequestIdRef.current = action.requestId;
	}, [dispatch]);

	return {
		isSubmitting: updateKiosk.status === 'pending',
		handleSubmit,
	};
}

export function useKioskEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
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
		onUpdateSuccess,
	);

	const submit = useCallback(
		(body: KioskUpdateFormData) => {
			if (body.id) {
				handleSubmit({ id: body.id, body});
			}
		},
		[handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
