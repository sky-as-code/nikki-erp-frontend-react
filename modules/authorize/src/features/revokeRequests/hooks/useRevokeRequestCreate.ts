import { useUIState } from '@nikkierp/shell/contexts';
import { useUserContext } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, resolvePath } from 'react-router';

import type { CreateRevokeRequestInput } from '@/features/revokeRequests/revokeRequestService';

import { AuthorizeDispatch, revokeRequestActions, selectCreateRevokeRequest } from '@/appState';
import { handleGoBack } from '@/utils';


function prepareCreateData(data: any, userId: string): CreateRevokeRequestInput {
	return {
		attachmentUrl: data.attachmentUrl || undefined,
		comment: data.comment || undefined,
		requestorId: userId,
		receiverType: data.receiverType as CreateRevokeRequestInput['receiverType'],
		receiverId: data.receiverId,
		targetType: data.targetType as CreateRevokeRequestInput['targetType'],
		targetRef: data.targetRef || data.targetId,
	};
}

function useSubmitHandler(
	dispatch: AuthorizeDispatch,
	userId: string,
) {
	return React.useCallback((data: any) => {
		const requestData = prepareCreateData(data, userId);
		dispatch(revokeRequestActions.createRevokeRequest(requestData));
	}, [userId]);
}

export function useRevokeRequestCreateHandlers() {
	const userContext = useUserContext();
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
	const handleSubmit = useSubmitHandler(dispatch, userContext.user!.id);

	return { isSubmitting, handleCancel, handleSubmit };
}

