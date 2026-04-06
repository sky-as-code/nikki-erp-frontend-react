import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskModelActions, selectCreateKioskModel } from '@/appState';
import { KioskModel } from '@/features/kioskModels/types';


export interface KioskModelCreateFormData {
	name: string;
	code?: string;
	description?: string;
	status: KioskModel['status'];
	kioskType?: KioskModel['kioskType'];
}

export function kioskModelToCreateFormValues(model: KioskModel): KioskModelCreateFormData {
	return {
		name: model.name,
		code: model.code,
		description: model.description,
		status: model.status,
		kioskType: model.kioskType,
	};
}

export function formDataToKioskModelUpdatePayload(
	data: KioskModelCreateFormData,
): Partial<Omit<KioskModel, 'id' | 'createdAt' | 'etag'>> {
	return {
		name: data.name,
		description: data.description,
		status: data.status,
		kioskType: data.kioskType,
	};
}

function buildKioskModelCreatePayload(data: KioskModelCreateFormData): Omit<KioskModel, 'id' | 'createdAt' | 'etag'> {
	return {
		name: data.name,
		code: data.code || `KIOSK-MODEL-${Date.now()}`,
		description: data.description,
		status: data.status,
		kioskType: data.kioskType,
	};
}

export function useKioskModelCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createKioskModel = useMicroAppSelector(selectCreateKioskModel);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: KioskModelCreateFormData) => {
		const payload = buildKioskModelCreatePayload(data);
		dispatch(kioskModelActions.createKioskModel(payload));
	}, [dispatch]);

	const isSubmitting = createKioskModel.status === 'pending';

	React.useEffect(() => {
		if (createKioskModel.status === 'success') {
			notification.showInfo(
				translate('nikki.vendingMachine.kioskModels.messages.create_success', { name: createKioskModel.data?.name }),
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
			notification.showError(
				createKioskModel.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(kioskModelActions.resetCreateKioskModel());
		}
	}, [createKioskModel, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
