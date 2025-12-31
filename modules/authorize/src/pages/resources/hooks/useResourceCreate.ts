import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, resourceActions } from '@/appState';
import { Resource } from '@/features/resources';
import { validateResourceForm } from '@/features/resources/validation/resourceFormValidation';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


type FormType = Parameters<typeof validateResourceForm>[2];


function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function handleCreateResult(
	result: Awaited<ReturnType<ReturnType<typeof resourceActions.createResource>>>,
	formData: Partial<Resource>,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.resource.messages.create_success', { name: formData.name }),
			translate('nikki.general.messages.success'),
		);
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}
	else {
		const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.create_failed');
		notification.showError(errorMessage, translate('nikki.general.messages.error'));
	}
}

function useSubmitHandler(
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async (data: Partial<Resource>, form: FormType) => {
		const formData = cleanFormData(data);
		setIsSubmitting(true);

		if (!validateResourceForm(formData, true, form)) {
			setIsSubmitting(false);
			return;
		}

		const result = await dispatch(resourceActions.createResource(
			formData as Omit<Resource, 'id' | 'createdAt' | 'etag' | 'actions' | 'actionsCount'>,
		));

		handleCreateResult(result, formData, notification, translate, navigate, location);
		setIsSubmitting(false);
	}, [dispatch, notification, translate, navigate, location, setIsSubmitting]);
}

export function useResourceCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(dispatch, notification, translate, navigate, location, setIsSubmitting);

	return { isSubmitting, handleCancel, handleSubmit };
}
