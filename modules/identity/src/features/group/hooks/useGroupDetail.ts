
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { IdentityDispatch, groupActions, userActions } from '../../../appState';
import { selectGroupState, selectManageGroupUsers, selectUpdateGroup, selectDeleteGroup } from '../../../appState/group';

// eslint-disable-next-line max-lines-per-function
export function useGroupDetailHandlers(groupId: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { groupDetail } = useMicroAppSelector(selectGroupState);
	const updateCommand = useMicroAppSelector(selectUpdateGroup);
	const deleteCommand = useMicroAppSelector(selectDeleteGroup);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.group.messages.updateSuccess'), '',
			);
			navigate('..', { relative: 'path' });
			dispatch(groupActions.resetUpdateGroup());
		}
		if (updateCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.group.messages.updateError'), '',
			);
			dispatch(groupActions.resetUpdateGroup());
		}
	}, [updateCommand.status, dispatch, navigate, notification, t]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.group.messages.deleteSuccess'), '',
			);
			navigate('..', { relative: 'path' });
			dispatch(groupActions.resetDeleteGroup());
		}
		if (deleteCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.group.messages.deleteError'), '',
			);
			dispatch(groupActions.resetDeleteGroup());
		}
	}, [deleteCommand.status, dispatch, navigate, notification, t]);

	const handleUpdate = (data: any) => {
		if (groupId) {
			dispatch(groupActions.updateGroup({
				id: groupId,
				...data,
				etag: groupDetail?.etag,
			}));
		}
	};

	const handleDelete = () => {
		if (groupId) {
			dispatch(groupActions.deleteGroup(groupId));
		}
	};

	React.useEffect(() => {
		if (groupId) {
			dispatch(groupActions.getGroup(groupId));
			dispatch(userActions.listUsers(activeOrg!.id));
		}
	}, [groupId, dispatch, activeOrg]);

	return {
		handleUpdate,
		handleDelete,
	};
}

// eslint-disable-next-line max-lines-per-function
export function useGroupUserManagement(groupId: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { groupDetail } = useMicroAppSelector(selectGroupState);
	const activeOrg = useActiveOrgWithDetails();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const manageUsersCommand = useMicroAppSelector(selectManageGroupUsers);

	React.useEffect(() => {
		if (manageUsersCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.group.messages.manageUsersSuccess'), '',
			);
			dispatch(groupActions.resetManageUsers());
			dispatch(userActions.listUsers(activeOrg!.id));
		}
		if (manageUsersCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.group.messages.manageUsersError'), '',
			);
			dispatch(groupActions.resetManageUsers());
		}
	}, [manageUsersCommand.status, manageUsersCommand.error, dispatch, notification, t]);

	const handleAddUsers = (userIds: string[]) => {
		if ((userIds).length === 0) return;

		dispatch(groupActions.manageGroupUsers({
			id: groupId,
			add: userIds,
			etag: groupDetail.etag,
		}));
	};

	const handleRemoveUsers = (userIds: string[]) => {
		if ((userIds).length === 0) return;

		dispatch(groupActions.manageGroupUsers({
			id: groupId,
			remove: userIds,
			etag: groupDetail.etag,
		}));
	};

	return {
		handleAddUsers,
		handleRemoveUsers,
	};
}