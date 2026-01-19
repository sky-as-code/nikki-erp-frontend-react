import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, resolvePath } from 'react-router';

import { AuthorizeDispatch, revokeRequestActions, selectCreateRevokeRequest } from '@/appState';
import { handleGoBack } from '@/utils';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { CreateRevokeRequestInput } from '@/features/revokeRequests/revokeRequestService';


function prepareCreateData(data: any): CreateRevokeRequestInput {
	return {
		attachmentUrl: data.attachmentUrl || undefined,
		comment: data.comment || undefined,
		requestorId: '01JWNMZ36QHC7CQQ748H9NQ6J6', // Mock user ID - TODO: get from user context
		receiverType: data.receiverType as CreateRevokeRequestInput['receiverType'],
		receiverId: data.receiverId,
		targetType: data.targetType as CreateRevokeRequestInput['targetType'],
		targetRef: data.targetRef || data.targetId,
	};
}

function useSubmitHandler(
	dispatch: AuthorizeDispatch,
) {
	return React.useCallback((data: any) => {
		const requestData = prepareCreateData(data);
		dispatch(revokeRequestActions.createRevokeRequest(requestData));
	}, [dispatch]);
}

export function useRevokeRequestCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const create = useMicroAppSelector(selectCreateRevokeRequest);

	const isSubmitting = create.status === 'pending';

	React.useEffect(() => {
		if (create.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.revoke_request.messages.create_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(revokeRequestActions.resetCreateRevokeRequest());
			const listPath = resolvePath('..', location.pathname).pathname;
			navigate(listPath);
		}
		if (create.status === 'error') {
			const msg = create.error ?? translate('nikki.general.errors.create_failed');
			notification.showError(msg, translate('nikki.general.messages.error'));
			dispatch(revokeRequestActions.resetCreateRevokeRequest());
		}
	}, [create.status, create.error, notification, translate, dispatch, navigate, location]);

	const handleCancel = handleGoBack(navigate, location);
	const handleSubmit = useSubmitHandler(dispatch);

	return { isSubmitting, handleCancel, handleSubmit };
}

