import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, resolvePath } from 'react-router';

import {
	AuthorizeDispatch,
	identityActions,
	revokeRequestActions,
	selectGroupList,
	selectRoleList,
	selectRoleSuiteList,
	selectUserList,
} from '@/appState';


import { useRevokeRequestFilter } from './useRevokeRequestFilter';
import { useUserContext } from '../../../../../../libs/shell/src/userContext/userContextSelectors';
import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { CreateRevokeRequestInput } from '@/features/revoke_requests/revokeRequestService';


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

function handleSubmitSuccess(
	result: Awaited<ReturnType<ReturnType<typeof revokeRequestActions.createRevokeRequests>>>,
	items: CreateRevokeRequestInput[],
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	notification.showInfo(
		translate('nikki.authorize.revoke_request.messages.revoke_success', { count: items.length }),
		translate('nikki.general.messages.success'),
	);
	dispatch(revokeRequestActions.listRevokeRequests());
	navigate(resolvePath('..', location.pathname).pathname);
}

function handleSubmitError(
	result: Awaited<ReturnType<ReturnType<typeof revokeRequestActions.createRevokeRequests>>>,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
) {
	const msg = typeof result.payload === 'string'
		? result.payload
		: translate('nikki.general.errors.create_failed');
	notification.showError(msg, translate('nikki.general.messages.error'));
}

function useSubmitState() {
	return React.useState(false);
}

// eslint-disable-next-line max-lines-per-function
function useSubmitCallback(
	requestorId: string,
	comment: string,
	attachmentUrl: string,
	getSelectedAssignments: () => SelectedAssignment[],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	return React.useCallback(async () => {
		const selected = getSelectedAssignments();
		if (selected.length === 0) return;

		setIsSubmitting(true);
		const items = buildCreateItems(selected, requestorId, comment, attachmentUrl);
		const result = await dispatch(revokeRequestActions.createRevokeRequests({ items }));

		if (result.meta.requestStatus === 'fulfilled') {
			handleSubmitSuccess(result, items, dispatch, notification, translate, navigate, location);
		}
		else {
			handleSubmitError(result, notification, translate);
		}
		setIsSubmitting(false);
	}, [attachmentUrl,
		comment,
		dispatch,
		getSelectedAssignments,
		location,
		navigate,
		notification,
		requestorId,
		setIsSubmitting,
		translate,
	]);
}

function useSubmitHandler(
	requestorId: string,
	comment: string,
	attachmentUrl: string,
	getSelectedAssignments: () => SelectedAssignment[],
) {
	const [isSubmitting, setIsSubmitting] = useSubmitState();
	const handleSubmit = useSubmitCallback(
		requestorId,
		comment,
		attachmentUrl,
		getSelectedAssignments,
		setIsSubmitting,
	);
	return { handleSubmit, isSubmitting };
}

function useCancelHandler() {
	const navigate = useNavigate();
	const location = useLocation();
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

export function useRevokeRequestCreatePage() {
	const userContext = useUserContext();
	const requestorId = '01JWNMZ36QHC7CQQ748H9NQ6J6'; // Mock user ID - TODO: get from user context
	const pageData = usePageData();
	const formState = useFormState();
	const filter = useRevokeRequestFilter();
	const { handleSubmit, isSubmitting } = useSubmitHandler(
		requestorId,
		formState.comment,
		formState.attachmentUrl,
		filter.getSelectedAssignments,
	);
	const handleCancel = useCancelHandler();

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

