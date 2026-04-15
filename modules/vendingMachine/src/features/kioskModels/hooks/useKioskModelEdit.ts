import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskModelActions, selectUpdateKioskModel } from '@/appState';

import type { KioskModel } from '@/features/kioskModels/types';



export type KioskModelUpdateFormData = {id: string; etag: string;} & Pick<
	Partial<KioskModel>,
	| 'referenceCode'
	| 'name'
	| 'description'
	| 'shelvesNumber'
	| 'shelvesConfig'
	| 'goodsCollectorType'
>;

export type KioskModelUpdatePayload = { id: string; body: KioskModelUpdateFormData };

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	onUpdateSuccess?: () => void,
) {
	const updateState = useMicroAppSelector(selectUpdateKioskModel);
	const updateRequestIdRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		const requestId = updateState.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateState.status === 'success') {
			updateRequestIdRef.current = null;
			onUpdateSuccess?.();
			notification.showInfo(
				translate('nikki.vendingMachine.kioskModels.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskModelActions.resetUpdateKioskModel());
		}
		else if (updateState.status === 'error') {
			updateRequestIdRef.current = null;
			notification.showError(
				updateState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskModelActions.resetUpdateKioskModel());
		}
	}, [updateState, dispatch, notification, translate, navigate, location, onUpdateSuccess]);

	const handleSubmit = useCallback((payload: KioskModelUpdatePayload) => {
		const action = dispatch(kioskModelActions.updateKioskModel(payload));
		updateRequestIdRef.current = action.requestId;
	}, [dispatch]);

	return {
		isSubmitting: updateState.status === 'pending',
		handleSubmit,
	};
}

export function useKioskModelEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
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
		(modelData: KioskModelUpdateFormData) => {
			if (modelData.id) {
				handleSubmit({ id: modelData.id, body: modelData });
			}
		},
		[handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
