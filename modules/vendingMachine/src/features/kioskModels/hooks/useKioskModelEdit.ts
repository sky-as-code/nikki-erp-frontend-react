import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskModelActions, selectUpdateKioskModel } from '@/appState';

import type { KioskModel, UpdateKioskModelBody } from '@/features/kioskModels/types';


type UpdatePayload = { id: string; body: UpdateKioskModelBody };

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	onUpdateSuccess?: () => void,
	modelId?: string,
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
			if (modelId) {
				dispatch(kioskModelActions.getKioskModel(modelId));
			}
		}
		else if (updateState.status === 'error') {
			updateRequestIdRef.current = null;
			notification.showError(
				updateState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskModelActions.resetUpdateKioskModel());
		}
	}, [updateState, dispatch, notification, translate, navigate, location]);

	return {
		isSubmitting: updateState.status === 'pending',
		handleSubmit: (payload: UpdatePayload) => {
			const action = dispatch(kioskModelActions.updateKioskModel(payload));
			updateRequestIdRef.current = action.requestId;
		},
	};
}

export function useKioskModelEdit(model: KioskModel | undefined, options?: { onUpdateSuccess?: () => void }) {
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
		model?.id,
	);

	const submit = useCallback(
		(updates: Partial<Omit<KioskModel, 'id' | 'createdAt' | 'etag'>>) => {
			if (model) {
				handleSubmit({
					id: model.id,
					body: { id: model.id, etag: model.etag, ...updates },
				});
			}
		},
		[model?.id, model?.etag, handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
