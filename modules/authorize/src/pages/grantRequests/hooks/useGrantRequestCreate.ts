import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, resolvePath } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import { AuthorizeDispatch, grantRequestActions, selectCreateGrantRequest } from '@/appState';
import { GrantRequest } from '@/features/grantRequests/types';


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

function useSubmitHandler(dispatch: AuthorizeDispatch) {
	return React.useCallback((data: any) => {
		const requestData = prepareCreateData(data);
		dispatch(grantRequestActions.createGrantRequest(requestData));
	}, [dispatch]);
}

export function useGrantRequestCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createCommand = useMicroAppSelector(selectCreateGrantRequest);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(dispatch);

	const isSubmitting = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.grant_request.messages.create_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(grantRequestActions.resetCreateGrantRequest());
			const listPath = resolvePath('..', location.pathname).pathname;
			navigate(listPath);
		}

		if (createCommand.status === 'error') {
			notification.showError(
				createCommand.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(grantRequestActions.resetCreateGrantRequest());
		}

	}, [createCommand.status, createCommand.error, notification, translate, dispatch, navigate, location]);

	return { isSubmitting, handleCancel, handleSubmit };
}

