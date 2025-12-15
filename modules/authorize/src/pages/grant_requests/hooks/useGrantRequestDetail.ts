import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { resolvePath } from 'react-router';

import { AuthorizeDispatch, grantRequestActions, selectGrantRequestState } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


export function useGrantRequestDetailData() {
	const { grantRequestId } = useParams<{ grantRequestId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { items, detail, isLoadingDetail } = useMicroAppSelector(selectGrantRequestState);

	const item = React.useMemo(() => {
		if (grantRequestId) {
			return items.find((i) => i.id === grantRequestId) || (detail?.id === grantRequestId ? detail : undefined);
		}
		return undefined;
	}, [grantRequestId, items, detail]);

	React.useEffect(() => {
		if (!item && grantRequestId) {
			dispatch(grantRequestActions.getGrantRequest(grantRequestId));
		}
	}, [dispatch, item, grantRequestId]);

	return { grantRequest: item, isLoading: isLoadingDetail };
}

export function useGrantRequestDetailHandlers(grantRequestId?: string) {
	const navigate = useNavigate();
	const { notification } = useUIState();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleBack = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate]);

	const handleApprove = React.useCallback(async () => {
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
	}, [dispatch, grantRequestId, notification]);

	const handleReject = React.useCallback(async () => {
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
	}, [dispatch, grantRequestId, notification]);

	const handleCancelRequest = React.useCallback(async () => {
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
	}, [dispatch, grantRequestId, notification]);

	return { handleBack, handleApprove, handleReject, handleCancelRequest, isSubmitting };
}

