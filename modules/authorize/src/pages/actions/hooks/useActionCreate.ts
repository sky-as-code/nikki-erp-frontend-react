import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, actionActions } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';


function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function handleCreateResult(
	result: Awaited<ReturnType<ReturnType<typeof actionActions.createAction>>>,
	formData: Partial<Action>,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.action.messages.create_success', { name: formData.name }),
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
	return React.useCallback(async (data: unknown) => {
		const formData = cleanFormData(data as Partial<Action>);
		setIsSubmitting(true);

		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';
		const result = await dispatch(actionActions.createAction(
			formData as Omit<Action, 'id' | 'createdAt' | 'etag' | 'resources' | 'entitlementsCount'>,
		));

		handleCreateResult(result, formData, notification, translate, navigate, location);
		setIsSubmitting(false);
	}, [dispatch, notification, location, translate, navigate, setIsSubmitting]);
}

export function useActionCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(dispatch, notification, translate, navigate, location, setIsSubmitting);

	return { isSubmitting, handleSubmit, handleCancel };
}

