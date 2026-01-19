import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, resolvePath } from 'react-router';



import { useRevokeRequestFilter } from './useRevokeRequestFilter';
import { useUserContext } from '../../../../../../libs/shell/src/userContext/userContextSelectors';
import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { CreateRevokeRequestInput } from '@/features/revokeRequests/revokeRequestService';

import {
	AuthorizeDispatch,
	identityActions,
	revokeRequestActions,
	selectCreateManyRevokeRequest,
	selectGroupList,
	selectRoleList,
	selectRoleSuiteList,
	selectUserList,
} from '@/appState';


function usePageData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const roles = useMicroAppSelector(selectRoleList);
	const roleSuites = useMicroAppSelector(selectRoleSuiteList);
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);

	// Only load initial data for dropdowns
	// Filtered results are handled by useRevokeRequestFilter hooks
	React.useEffect(() => {
		// Load users and groups for receiver dropdown
		if (users.length === 0) dispatch(identityActions.listUsers());
		if (groups.length === 0) dispatch(identityActions.listGroups());
		// Roles and roleSuites will be loaded on-demand:
		// - When filtering by receiver: loaded with graph filter via useRevokeRequestFilter
		// - When filtering by target: loaded without filter for dropdown options
		// Don't preload here to avoid loading all data unnecessarily
	}, [dispatch, users.length, groups.length]);

	return { roles, roleSuites, users, groups };
}

function useFormState() {
	const [comment, setComment] = React.useState('');
	const [attachmentUrl, setAttachmentUrl] = React.useState('');
	return { comment, setComment, attachmentUrl, setAttachmentUrl };
}

type SelectedAssignment = {
	receiverType: string;
	receiverId: string;
	targetType: string;
	targetId: string;
};

function buildCreateItems(
	selected: SelectedAssignment[],
	requestorId: string,
	comment: string,
	attachmentUrl: string,
): CreateRevokeRequestInput[] {
	return selected.map((a) => ({
		requestorId,
		receiverType: a.receiverType as CreateRevokeRequestInput['receiverType'],
		receiverId: a.receiverId,
		targetType: a.targetType as CreateRevokeRequestInput['targetType'],
		targetRef: a.targetId,
		comment: comment || undefined,
		attachmentUrl: attachmentUrl || undefined,
	}));
}

function useSubmitCallback(
	requestorId: string,
	comment: string,
	attachmentUrl: string,
	getSelectedAssignments: () => SelectedAssignment[],
) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();

	return React.useCallback(() => {
		const selected = getSelectedAssignments();
		if (selected.length === 0) return;

		const items = buildCreateItems(selected, requestorId, comment, attachmentUrl);
		dispatch(revokeRequestActions.createRevokeRequests({ items }));
	}, [attachmentUrl, comment, dispatch, getSelectedAssignments, requestorId]);
}

function useSubmitHandler(
	requestorId: string,
	comment: string,
	attachmentUrl: string,
	getSelectedAssignments: () => SelectedAssignment[],
) {
	const handleSubmit = useSubmitCallback(
		requestorId,
		comment,
		attachmentUrl,
		getSelectedAssignments,
	);
	return { handleSubmit };
}

function useCancelHandler() {
	const navigate = useNavigate();
	const location = useLocation();
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

// eslint-disable-next-line max-lines-per-function
export function useRevokeRequestCreate() {
	const userContext = useUserContext();
	const requestorId = '01JWNMZ36QHC7CQQ748H9NQ6J6'; // Mock user ID - TODO: get from user context
	const pageData = usePageData();
	const formState = useFormState();
	const filter = useRevokeRequestFilter();
	const { handleSubmit } = useSubmitHandler(
		requestorId,
		formState.comment,
		formState.attachmentUrl,
		filter.getSelectedAssignments,
	);
	const handleCancel = useCancelHandler();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const createMany = useMicroAppSelector(selectCreateManyRevokeRequest);

	const isSubmitting = createMany.status === 'pending';

	React.useEffect(() => {
		if (createMany.status === 'success') {
			const count = createMany.data?.count ?? 0;
			notification.showInfo(
				translate('nikki.authorize.revoke_request.messages.revoke_success', { count }),
				translate('nikki.general.messages.success'),
			);
			dispatch(revokeRequestActions.resetCreateManyRevokeRequest());
			dispatch(revokeRequestActions.listRevokeRequests());
			navigate(resolvePath('..', location.pathname).pathname);
		}
		if (createMany.status === 'error') {
			const msg = createMany.error ?? translate('nikki.general.errors.create_failed');
			notification.showError(msg, translate('nikki.general.messages.error'));
			dispatch(revokeRequestActions.resetCreateManyRevokeRequest());
		}
	}, [createMany.status, createMany.data, createMany.error, notification, translate, dispatch, navigate, location]);

	return {
		...pageData,
		...formState,
		...filter,
		requestorId,
		handleSubmit,
		handleCancel,
		isSubmitting,
	};
}

