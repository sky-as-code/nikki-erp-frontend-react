import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { resolvePath } from 'react-router';

import { AuthorizeDispatch, grantRequestActions, selectGrantRequestState } from '@/appState';
import { GrantRequest } from '@/features/grant_requests';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


export function useGrantRequestDetailData() {
	const { grantRequestId } = useParams<{ grantRequestId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { grantRequests, grantRequestDetail, isLoadingDetail } = useMicroAppSelector(selectGrantRequestState);

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
	}, [dispatch, item, grantRequestId]);

	return { grantRequest: item, isLoading: isLoadingDetail };
}

function useBackHandler(navigate: ReturnType<typeof useNavigate>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate]);
}

function useApproveHandler(
	grantRequestId: string | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async () => {
		if (!grantRequestId) return;
		setIsSubmitting(true);
		const result = await dispatch(grantRequestActions.respondGrantRequest({ id: grantRequestId, decision: 'approve' }));
		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo('Request approved successfully', 'Success');
			dispatch(grantRequestActions.getGrantRequest(grantRequestId));
		}
		else {
			const msg = typeof result.payload === 'string' ? result.payload : 'Failed to approve';
			notification.showError(msg, 'Error');
		}
		setIsSubmitting(false);
	}, [dispatch, grantRequestId, notification, setIsSubmitting]);
}

function useRejectHandler(
	grantRequestId: string | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async () => {
		if (!grantRequestId) return;
		setIsSubmitting(true);
		const result = await dispatch(grantRequestActions.respondGrantRequest({ id: grantRequestId, decision: 'deny' }));
		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo('Request rejected', 'Success');
			dispatch(grantRequestActions.getGrantRequest(grantRequestId));
		}
		else {
			const msg = typeof result.payload === 'string' ? result.payload : 'Failed to reject';
			notification.showError(msg, 'Error');
		}
		setIsSubmitting(false);
	}, [dispatch, grantRequestId, notification, setIsSubmitting]);
}

function useCancelRequestHandler(
	grantRequestId: string | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async () => {
		if (!grantRequestId) return;
		setIsSubmitting(true);
		const result = await dispatch(grantRequestActions.cancelGrantRequest({ id: grantRequestId }));
		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo('Request cancelled', 'Success');
			dispatch(grantRequestActions.getGrantRequest(grantRequestId));
		}
		else {
			const msg = typeof result.payload === 'string' ? result.payload : 'Failed to cancel';
			notification.showError(msg, 'Error');
		}
		setIsSubmitting(false);
	}, [dispatch, grantRequestId, notification, setIsSubmitting]);
}

export function useGrantRequestDetailHandlers(grantRequestId?: string) {
	const navigate = useNavigate();
	const { notification } = useUIState();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleBack = useBackHandler(navigate);
	const handleApprove = useApproveHandler(grantRequestId, dispatch, notification, setIsSubmitting);
	const handleReject = useRejectHandler(grantRequestId, dispatch, notification, setIsSubmitting);
	const handleCancelRequest = useCancelRequestHandler(grantRequestId, dispatch, notification, setIsSubmitting);

	return { handleBack, handleApprove, handleReject, handleCancelRequest, isSubmitting };
}

