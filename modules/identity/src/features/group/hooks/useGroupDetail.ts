
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { IdentityDispatch, groupActions, userActions } from '../../../appState';
import { selectManageGroupUsers, selectUpdateGroup, selectDeleteGroup, selectGroupDetail } from '../../../appState/group';
import { useOrgScopeRef } from '../../../hooks';

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
	const orgScopeRef = useOrgScopeRef();
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
				data: {
					id: groupDetail.data.id,
					...dataWithTag,
				},
				scopeRef: orgScopeRef,
			}));
		}
	};

	const handleDelete = () => {
		if (groupDetail?.data.id) {
			dispatch(groupActions.deleteGroup({ id: groupDetail.data.id, scopeRef: orgScopeRef }));
		}
	};

	React.useEffect(() => {
		if (groupId) {
			dispatch(groupActions.getGroup({ id: groupId, scopeRef: orgScopeRef }));
			dispatch(userActions.listUsers({ scopeRef: orgScopeRef }));
		}
	}, [groupId, dispatch, orgScopeRef]);

	return {
		isLoadingDetail,
		handleUpdate,
		handleDelete,
	};
}


// eslint-disable-next-line max-lines-per-function
export function useGroupUserManagement() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	// Both Group and User are org-scoped
	const orgScopeRef = useOrgScopeRef();
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
			dispatch(userActions.listUsers({ scopeRef: orgScopeRef }));
		}
		if (manageUsersCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.group.messages.manageUsersError'), '',
			);
			dispatch(groupActions.resetManageUsers());
		}
	}, [manageUsersCommand.status, manageUsersCommand.error, dispatch, notification, t, orgScopeRef]);

	const handleAddUsers = (userIds: string[]) => {
		if ((userIds).length === 0 || !groupDetail?.data.id) return;

		dispatch(groupActions.manageGroupUsers({
			data: {
				id: groupDetail.data.id,
				add: userIds,
				etag: groupDetail.data.etag,
			},
			scopeRef: orgScopeRef,
		}));
	};

	const handleRemoveUsers = (userIds: string[]) => {
		if ((userIds).length === 0 || !groupDetail?.data.id) return;

		dispatch(groupActions.manageGroupUsers({
			data: {
				id: groupDetail.data.id,
				remove: userIds,
				etag: groupDetail.data.etag,
			},
			scopeRef: orgScopeRef,
		}));
	};

	return {
		isLoadingManageUsers,
		handleAddUsers,
		handleRemoveUsers,
	};
}