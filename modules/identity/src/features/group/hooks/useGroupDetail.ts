
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { IdentityDispatch, groupActions, userActions } from '../../../appState';
import { selectManageGroupUsers, selectUpdateGroup, selectDeleteGroup, selectGroupDetail } from '../../../appState/group';

// eslint-disable-next-line max-lines-per-function
export function useGroupDetailHandlers() {
	const { groupId } = useParams();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const groupDetail = useMicroAppSelector(selectGroupDetail);
	const updateCommand = useMicroAppSelector(selectUpdateGroup);
	const deleteCommand = useMicroAppSelector(selectDeleteGroup);

	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const activeOrg = useActiveOrgWithDetails();
	const isLoadingDetail = updateCommand.status === 'pending' || deleteCommand.status === 'pending';

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
		if (groupDetail?.data.id) {
			const dataWithTag = { ...data, etag: groupDetail.data.etag };
			dispatch(groupActions.updateGroup({
				id: groupDetail.data.id,
				...dataWithTag,
			}));
		}
	};

	const handleDelete = () => {
		if (groupDetail?.data.id) {
			dispatch(groupActions.deleteGroup(groupDetail.data.id));
		}
	};

	React.useEffect(() => {
		if (groupId) {
			dispatch(groupActions.getGroup(groupId));
			dispatch(userActions.listUsers(activeOrg!.id));
		}
	}, [groupId, dispatch, activeOrg]);

	return {
		isLoadingDetail,
		handleUpdate,
		handleDelete,
	};
}

// eslint-disable-next-line max-lines-per-function
export function useGroupUserManagement() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const activeOrg = useActiveOrgWithDetails();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const groupDetail = useMicroAppSelector(selectGroupDetail);
	const manageUsersCommand = useMicroAppSelector(selectManageGroupUsers);
	const isLoadingManageUsers = manageUsersCommand.status === 'pending';

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
		if ((userIds).length === 0 || !groupDetail?.data.id) return;

		dispatch(groupActions.manageGroupUsers({
			id: groupDetail.data.id,
			add: userIds,
			etag: groupDetail.data.etag,
		}));
	};

	const handleRemoveUsers = (userIds: string[]) => {
		if ((userIds).length === 0 || !groupDetail?.data.id) return;

		dispatch(groupActions.manageGroupUsers({
			id: groupDetail.data.id,
			remove: userIds,
			etag: groupDetail.data.etag,
		}));
	};

	return {
		isLoadingManageUsers,
		handleAddUsers,
		handleRemoveUsers,
	};
}