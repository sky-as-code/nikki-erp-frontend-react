import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { resolvePath } from 'react-router';

import { AuthorizeDispatch, revokeRequestActions, selectRevokeRequestState } from '@/appState';
import { RevokeRequest } from '@/features/revoke_requests/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


export function useRevokeRequestDetailData() {
	const { revokeRequestId } = useParams<{ revokeRequestId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { revokeRequests, revokeRequestDetail, isLoadingDetail } = useMicroAppSelector(selectRevokeRequestState);

	const item = React.useMemo(() => {
		if (revokeRequestId) {
			const found = revokeRequests.find((i: RevokeRequest) => i.id === revokeRequestId);
			return found || (revokeRequestDetail?.id === revokeRequestId ? revokeRequestDetail : undefined);
		}
		return undefined;
	}, [revokeRequestId, revokeRequests, revokeRequestDetail]);

	React.useEffect(() => {
		if (!item && revokeRequestId) {
			dispatch(revokeRequestActions.getRevokeRequest(revokeRequestId));
		}
	}, [dispatch, item, revokeRequestId]);

	return { revokeRequest: item, isLoading: isLoadingDetail };
}

function useBackHandler(navigate: ReturnType<typeof useNavigate>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate]);
}

function useDeleteHandler(
	revokeRequest: RevokeRequest | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
	navigate: ReturnType<typeof useNavigate>,
) {
	return React.useCallback(async () => {
		if (!revokeRequest) return;
		setIsSubmitting(true);
		const result = await dispatch(revokeRequestActions.deleteRevokeRequest({ id: revokeRequest.id }));
		if (result.meta.requestStatus === 'fulfilled') {
			const targetName = revokeRequest.target?.name || revokeRequest.targetRef;
			notification.showInfo(
				`Revoke request for ${targetName} deleted successfully`,
				'Success',
			);
			dispatch(revokeRequestActions.listRevokeRequests());
			navigate(resolvePath('..', location.pathname).pathname);
		}
		else {
			const msg = typeof result.payload === 'string' ? result.payload : 'Failed to delete';
			notification.showError(msg, 'Error');
		}
		setIsSubmitting(false);
	}, [dispatch, revokeRequest, notification, setIsSubmitting, navigate]);
}

export function useRevokeRequestDetailHandlers(revokeRequest?: RevokeRequest) {
	const navigate = useNavigate();
	const { notification } = useUIState();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleBack = useBackHandler(navigate);
	const handleDelete = useDeleteHandler(
		revokeRequest,
		dispatch,
		notification,
		setIsSubmitting,
		navigate,
	);

	return { handleBack, handleDelete, isSubmitting };
}

