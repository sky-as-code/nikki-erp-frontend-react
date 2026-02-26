import { useUIState } from '@nikkierp/shell/contexts';
import { useMyOrgs, useUserContext } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, resolvePath } from 'react-router';

import type { Group, Org, User } from '@/features/identities';

import {
	AuthorizeDispatch,
	grantRequestActions,
	identityActions,
	roleActions,
	roleSuiteActions,
	selectCreateGrantRequest,
	selectGroupList,
	selectRoleList,
	selectRoleSuiteList,
	selectUserList,
} from '@/appState';


function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [location]);
}

function useSubmitHandler(dispatch: AuthorizeDispatch, requestorId: string) {
	return React.useCallback((data: any) => {
		data = {
			...data,
			requestorId: requestorId,
		};
		dispatch(grantRequestActions.createGrantRequest(data));
	}, []);
}

function useGrantRequestCreateData(dispatch: AuthorizeDispatch) {
	const roles = useMicroAppSelector(selectRoleList);
	const roleSuites = useMicroAppSelector(selectRoleSuiteList);
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);
	const assignedOrgs = useMyOrgs();
	const [selectedOrgId, setSelectedOrgId] = React.useState<string | null | undefined>(undefined);
	const [selectedReceiverOrgId, setSelectedReceiverOrgId] = React.useState<string | null | undefined>(undefined);

	const orgs = React.useMemo<Org[]>(
		() => assignedOrgs.map((org) => ({
			id: org.id,
			displayName: org.name,
			slug: org.slug,
			status: 'active',
		})),
		[assignedOrgs],
	);

	const { filteredUsers, filteredGroups } = useAggregate(orgs, users, groups, selectedReceiverOrgId);
	useFetchIdentityData(dispatch, selectedReceiverOrgId, selectedOrgId);

	return {
		roles,
		roleSuites,
		orgs,
		filteredUsers,
		filteredGroups,
		selectedOrgId,
		setSelectedOrgId,
		selectedReceiverOrgId,
		setSelectedReceiverOrgId,
	};
}

function useAggregate(
	orgs: Org[],
	users: User[],
	groups: Group[],
	selectedReceiverOrgId: string | null | undefined,
){
	const assignedOrgIdSet = React.useMemo(
		() => new Set(orgs.map((org) => org.id)),
		[orgs],
	);

	const filteredUsers = React.useMemo(
		() => users.filter((user: User) => {
			const userOrgIds = (user.orgs ?? [])
				.map((org: { id: string }) => org.id)
				.filter((orgId: string) => assignedOrgIdSet.has(orgId));
			if (userOrgIds.length === 0) {
				return selectedReceiverOrgId !== undefined;
			}
			if (selectedReceiverOrgId && selectedReceiverOrgId !== null) {
				return userOrgIds.includes(selectedReceiverOrgId);
			}
			return true;
		}),
		[users, assignedOrgIdSet, selectedReceiverOrgId],
	);

	const filteredGroups = React.useMemo(
		() => groups.filter((group: Group) => {
			if (!group.orgId) {
				return selectedReceiverOrgId !== undefined;
			}
			if (!assignedOrgIdSet.has(group.orgId)) return false;
			if (selectedReceiverOrgId && selectedReceiverOrgId !== null) {
				return group.orgId === selectedReceiverOrgId;
			}
			return true;
		}),
		[groups, assignedOrgIdSet, selectedReceiverOrgId],
	);

	return { filteredUsers, filteredGroups};
}

function useFetchIdentityData(
	dispatch: AuthorizeDispatch,
	selectedReceiverOrgId: string | null | undefined,
	selectedOrgId: string | null | undefined,
) {
	React.useEffect(() => {
		if (selectedReceiverOrgId === undefined) {
			return;
		}
		if (selectedReceiverOrgId === null) {
			dispatch(identityActions.listUsers());
			dispatch(identityActions.listGroups());
			return;
		}

		dispatch(identityActions.listUsers({
			graph: {
				if: ['orgs.id', '=', selectedReceiverOrgId],
			},
		}));
		dispatch(identityActions.listGroups({
			graph: {
				if: ['org_id', '=', selectedReceiverOrgId],
			},
		}));
	}, [selectedReceiverOrgId]);

	React.useEffect(() => {
		if (selectedOrgId === undefined) return;
		dispatch(roleActions.listRoles({ orgId: selectedOrgId }));
		dispatch(roleSuiteActions.listRoleSuites({ orgId: selectedOrgId }));
	}, [selectedOrgId]);
}


export function useGrantRequestCreate() {
	const userContext = useUserContext();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createCommand = useMicroAppSelector(selectCreateGrantRequest);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(dispatch, userContext.user!.id);
	const data = useGrantRequestCreateData(dispatch);

	const isSubmitting = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.grant_request.messages.create_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(grantRequestActions.listGrantRequests());
			dispatch(grantRequestActions.resetCreateGrantRequest());
			navigate(resolvePath('..', location.pathname).pathname);
		}

		if (createCommand.status === 'error') {
			notification.showError(
				createCommand.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(grantRequestActions.resetCreateGrantRequest());
		}

	}, [createCommand, location]);

	return { isSubmitting, handleCancel, handleSubmit, ...data };
}
