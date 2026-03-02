import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { IdentityDispatch, organizationActions } from '../../../appState';
import { selectManageOrganizationUsers, selectOrganizationDetail, selectOrganizationList } from '../../../appState/organization';
import { selectListAllUsers, userActions, selectUserDetail } from '../../../appState/user';
import { useOrgScopeRef } from '../../../hooks';
import { Organization } from '../../organization/types';
import { User } from '../types';


// eslint-disable-next-line max-lines-per-function
export function useManageOrganizationAddUsers() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const orgActiveDetails = useActiveOrgWithDetails();
	const manageUsersCommand = useMicroAppSelector(selectManageOrganizationUsers);
	const organizationDetail = useMicroAppSelector(selectOrganizationDetail);
	const organizationList = useMicroAppSelector(selectOrganizationList);
	const allUsersList = useMicroAppSelector(selectListAllUsers);
	const { notification } = useUIState();
	const { t } = useTranslation();

	const [opened, setOpened] = React.useState(false);
	const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
	const [selectedOrgId, setSelectedOrgId] = React.useState<string | null>(null);
	const isLoadingManageUsers = manageUsersCommand.status === 'pending';
	const isLoadingAllUsers = allUsersList.status === 'pending';
	const isLoadingOrgs = organizationList.status === 'pending';

	const targetOrg = selectedOrgId && organizationList.data
		? (organizationList.data as Organization[]).find((org) => org.id === selectedOrgId)
		: orgActiveDetails;

	const showOrgSelector = !orgActiveDetails || !organizationDetail.data;

	React.useEffect(() => {
		if (targetOrg?.slug) {
			dispatch(organizationActions.getOrganization(targetOrg.slug));
		}
	}, [targetOrg?.slug, dispatch]);

	React.useEffect(() => {
		if (opened) {
			dispatch(userActions.listAllUsers());
			if (showOrgSelector) {
				dispatch(organizationActions.listOrganizations());
			}
		}
	}, [opened, dispatch, showOrgSelector]);

	const allUsers = (allUsersList.data || []) as User[];
	const addOptions = !allUsers.length || !targetOrg?.id
		? []
		: allUsers
			.filter((u: User) => !u.orgs?.some((org) => org.id === targetOrg.id))
			.map((u: User) => ({
				value: u.id,
				label: `${u.displayName} (${u.email})`,
			}));

	const orgs = (organizationList.data || []) as Organization[];
	const organizationOptions = orgs.map((org) => ({
		value: org.id,
		label: `${org.displayName} (${org.slug})`,
	}));

	React.useEffect(() => {
		if (manageUsersCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.organization.messages.manageUsersSuccess'), '',
			);
			setSelectedUserIds([]);
			setOpened(false);
			dispatch(organizationActions.resetManageOrganizationUsers());
			dispatch(userActions.listAllUsers());
			dispatch(userActions.listUsers({ scopeRef: orgActiveDetails?.id }));
		}
		if (manageUsersCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.organization.messages.manageUsersError'), '',
			);
			dispatch(organizationActions.resetManageOrganizationUsers());
		}
	}, [manageUsersCommand.status, dispatch, notification, t, targetOrg?.id]);

	const handleSubmit = () => {
		if (!targetOrg || selectedUserIds.length === 0 || !organizationDetail.data?.etag) return;

		dispatch(organizationActions.manageOrganizationUsers({
			id: targetOrg.id,
			add: selectedUserIds,
			etag: organizationDetail.data.etag,
		}));
	};

	return {
		opened,
		selectedUserIds,
		addOptions,
		isLoading: isLoadingAllUsers || isLoadingManageUsers || isLoadingOrgs,
		showOrgSelector,
		selectedOrgId,
		organizationOptions,
		onOpen: () => {
			setSelectedUserIds([]);
			setSelectedOrgId(null);
			setOpened(true);
		},
		onClose: () => {
			setOpened(false);
			setSelectedUserIds([]);
			setSelectedOrgId(null);
			dispatch(organizationActions.resetManageOrganizationUsers());
		},
		onSelectedChange: setSelectedUserIds,
		onOrgChange: setSelectedOrgId,
		onSubmit: handleSubmit,
	};
}

export function useManageOrganizationRemoveUsers() {
	const { userId } = useParams();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const scopeRef = useOrgScopeRef();

	const manageUsersCommand = useMicroAppSelector(selectManageOrganizationUsers);
	const userDetail = useMicroAppSelector(selectUserDetail);
	const isLoading = manageUsersCommand.status === 'pending';
	const userOrganizations = (userDetail?.data?.orgs || []) as Organization[];

	React.useEffect(() => {
		if (manageUsersCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.organization.messages.manageUsersSuccess'), '',
			);
			dispatch(organizationActions.resetManageOrganizationUsers());
			if (userId) {
				dispatch(userActions.getUser({ id: userId }));
			}
		}
		if (manageUsersCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.organization.messages.manageUsersError'), '',
			);
			dispatch(organizationActions.resetManageOrganizationUsers());
		}
	}, [manageUsersCommand.status, dispatch, notification, t, userId, scopeRef]);

	const handleRemoveOrganization = (orgId: string, etag: string) => {
		if (!userId || !orgId) return;

		dispatch(organizationActions.manageOrganizationUsers({
			id: orgId,
			remove: [userId],
			etag,
		}));
	};

	return {
		isLoading,
		userOrganizations,
		onRemoveOrganization: handleRemoveOrganization,
	};
}