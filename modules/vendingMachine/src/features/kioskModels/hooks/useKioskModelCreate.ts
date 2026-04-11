import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import type { KioskModel } from '@/features/kioskModels/types';

import { VendingMachineDispatch, kioskModelActions, selectCreateKioskModel } from '@/appState';



export type KioskModelCreateFormData = Pick<
	KioskModel,
	| 'name'
	| 'modelId'
	| 'referenceCode'
	| 'shelvesNumber'
	| 'description'
	| 'status'
	| 'kioskType'
>;

export type KioskModelCreatePayload = KioskModelCreateFormData;

export function useKioskModelCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createKioskModel = useMicroAppSelector(selectCreateKioskModel);
	const createRequestIdRef = React.useRef<string | null>(null);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: KioskModelCreatePayload) => {
		const action = dispatch(kioskModelActions.createKioskModel(data));
		createRequestIdRef.current = action.requestId;
	}, [dispatch]);

	const isSubmitting = createKioskModel.status === 'pending';

	React.useEffect(() => {
		const requestId = createKioskModel.requestId;
		const matchesDispatch = requestId != null && requestId === createRequestIdRef.current;
		if (!matchesDispatch) return;

		if (createKioskModel.status === 'success') {
			createRequestIdRef.current = null;
			notification.showInfo(
				translate('nikki.vendingMachine.kioskModels.messages.create_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(kioskModelActions.resetCreateKioskModel());
			dispatch(kioskModelActions.listKioskModels());
			const createdId = createKioskModel.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		}

		if (createKioskModel.status === 'error') {
			createRequestIdRef.current = null;
			notification.showError(
				createKioskModel.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskModelActions.resetCreateKioskModel());
		}
	}, [createKioskModel, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
