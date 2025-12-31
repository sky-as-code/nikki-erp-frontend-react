import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, resolvePath } from 'react-router';

import { AuthorizeDispatch, grantRequestActions } from '@/appState';
import { GrantRequest } from '@/features/grant_requests/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function prepareCreateData(data: any) {
	const requestData: Partial<GrantRequest> = {
		attachmentUrl: data.attachmentUrl || undefined,
		comment: data.comment || undefined,
		requestorId: '01JWNMZ36QHC7CQQ748H9NQ6J6', // Mock user ID - TODO: get from user context
		receiverType: data.receiverType,
		receiverId: data.receiverId,
		targetType: data.targetType,
		targetId: data.targetId,
		targetRef: data.targetRef,
		orgId: data.orgId || null,
	};

	return requestData;
}

function handleCreateResult(
	result: Awaited<ReturnType<ReturnType<typeof grantRequestActions.createGrantRequest>>>,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.grant_request.messages.create_success'),
			translate('nikki.general.messages.success'),
		);
		// Navigate to list page after successful create
		const listPath = resolvePath('..', location.pathname).pathname;
		navigate(listPath);
	}
	else {
		const msg = typeof result.payload === 'string'
			? result.payload
			: translate('nikki.general.errors.create_failed');
		notification.showError(msg, translate('nikki.general.messages.error'));
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
	return React.useCallback(async (data: any) => {
		setIsSubmitting(true);
		const requestData = prepareCreateData(data);
		const result = await dispatch(grantRequestActions.createGrantRequest(requestData));
		handleCreateResult(result, notification, translate, navigate, location);
		setIsSubmitting(false);
	}, [dispatch, notification, translate, navigate, location, setIsSubmitting]);
}

export function useGrantRequestCreateHandlers() {
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

