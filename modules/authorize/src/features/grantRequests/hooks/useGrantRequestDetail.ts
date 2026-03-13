import { useUIState } from '@nikkierp/shell/contexts';
import { useUserContext } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { resolvePath } from 'react-router';

import {
	AuthorizeDispatch,
	grantRequestActions,
	selectGrantRequestState,
	selectRespondGrantRequest,
	selectCancelGrantRequest,
} from '@/appState';
import { GrantRequest } from '@/features/grantRequests';


function useGrantRequestDetailData() {
	const { grantRequestId } = useParams<{ grantRequestId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { grantRequests, grantRequestDetail, list } = useMicroAppSelector(selectGrantRequestState);

	const item = React.useMemo(() => {
		if (grantRequestId) {
			const found = grantRequests.find((i: GrantRequest) => i.id === grantRequestId);
			return found || (grantRequestDetail?.id === grantRequestId ? grantRequestDetail : undefined);
		}
		return undefined;
	}, [grantRequestId, grantRequests, grantRequestDetail]);

	React.useEffect(() => {
		if (!item && grantRequestId) {
			dispatch(grantRequestActions.getGrantRequest(grantRequestId));
		}
	}, [item, grantRequestId]);

	return { grantRequest: item, isLoading: list.isLoading };
}

function useBackHandler(
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);
}

function useApproveHandler(
	grantRequest: GrantRequest | undefined,
	dispatch: AuthorizeDispatch,
	responderId: string | undefined,
) {
	return React.useCallback(() => {
		if (!grantRequest || !grantRequest.etag || !responderId) return;
		dispatch(grantRequestActions.respondGrantRequest({
			id: grantRequest.id,
			decision: 'approve',
			etag: grantRequest.etag,
			responderId,
		}));
	}, [grantRequest, responderId]);
}

function useRejectHandler(
	grantRequest: GrantRequest | undefined,
	dispatch: AuthorizeDispatch,
	responderId: string | undefined,
) {
	return React.useCallback(() => {
		if (!grantRequest || !grantRequest.etag || !responderId) return;
		dispatch(grantRequestActions.respondGrantRequest({
			id: grantRequest.id,
			decision: 'deny',
			etag: grantRequest.etag,
			responderId,
		}));
	}, [grantRequest, responderId]);
}

function useCancelRequestHandler(
	grantRequestId: string | undefined,
	dispatch: AuthorizeDispatch,
) {
	return React.useCallback(() => {
		if (!grantRequestId) return;
		dispatch(grantRequestActions.cancelGrantRequest({ id: grantRequestId }));
	}, [grantRequestId]);
}


function useGrantRequestDetailHandlers(grantRequest?: GrantRequest) {
	const userContext = useUserContext();
	const navigate = useNavigate();
	const location = useLocation();
	const { notification } = useUIState();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const responderId = userContext.user!.id;

	const respondCommand = useMicroAppSelector(selectRespondGrantRequest);
	const cancelCommand = useMicroAppSelector(selectCancelGrantRequest);

	const handleBack = useBackHandler(navigate, location);
	const handleApprove = useApproveHandler(grantRequest, dispatch, responderId);
	const handleReject = useRejectHandler(grantRequest, dispatch, responderId);
	const handleCancelRequest = useCancelRequestHandler(grantRequest?.id, dispatch);

	const isSubmitting = respondCommand.status === 'pending' || cancelCommand.status === 'pending';

	React.useEffect(() => {
		if (respondCommand.status === 'success') {
			notification.showInfo('Request responded successfully', 'Success');
			const listPath = resolvePath('..', location.pathname).pathname;
			dispatch(grantRequestActions.resetRespondGrantRequest());
			dispatch(grantRequestActions.listGrantRequests());
			navigate(listPath);
		}

		if (respondCommand.status === 'error') {
			notification.showError(
				respondCommand.error ?? 'Failed to respond',
				'Error',
			);
			dispatch(grantRequestActions.resetRespondGrantRequest());
		}
	}, [respondCommand]);

	React.useEffect(() => {
		if (cancelCommand.status === 'success') {
			notification.showInfo('Request cancelled', 'Success');
			dispatch(grantRequestActions.resetCancelGrantRequest());
			if (grantRequest?.id) {
				dispatch(grantRequestActions.getGrantRequest(grantRequest.id));
			}
		}

		if (cancelCommand.status === 'error') {
			notification.showError(
				cancelCommand.error ?? 'Failed to cancel',
				'Error',
			);
			dispatch(grantRequestActions.resetCancelGrantRequest());
		}
	}, [cancelCommand, grantRequest?.id]);

	return { handleBack, handleApprove, handleReject, handleCancelRequest, isSubmitting };
}

export const useGrantRequestDetail = {
	detail: useGrantRequestDetailData,
	handlers: useGrantRequestDetailHandlers,
};
