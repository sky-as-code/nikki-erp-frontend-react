import { useUIState } from '@nikkierp/shell/contexts';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { IdentityDispatch, hierarchyActions, userActions } from '../../../appState';
import { selectDeleteHierarchy, selectManageHierarchyUsers, selectUpdateHierarchy, selectHierarchyDetail } from '../../../appState/hierarchy';

// eslint-disable-next-line max-lines-per-function
export function useHierarchyDetailHandlers() {
	const { hierarchyId } = useParams();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const hierarchyDetail = useMicroAppSelector(selectHierarchyDetail);
	const activeOrg = useActiveOrgWithDetails();

	const updateCommand = useMicroAppSelector(selectUpdateHierarchy);
	const deleteCommand = useMicroAppSelector(selectDeleteHierarchy);
	const isLoadingDetail = updateCommand.status === 'pending' || deleteCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.hierarchy.messages.updateSuccess'), '',
			);
			dispatch(hierarchyActions.resetUpdateHierarchy());
			navigate('..', { relative: 'path' });
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.hierarchy.messages.updateError'), '',
			);
			dispatch(hierarchyActions.resetUpdateHierarchy());
		}
	}, [updateCommand.status, dispatch, navigate, notification, t]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.hierarchy.messages.deleteSuccess'), '',
			);
			dispatch(hierarchyActions.resetDeleteHierarchy());
			navigate('..', { relative: 'path' });
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.hierarchy.messages.deleteError'), '',
			);
			dispatch(hierarchyActions.resetDeleteHierarchy());
		}
	}, [deleteCommand.status, dispatch, navigate, notification, t]);

	const handleUpdate = (data: any) => {
		if (hierarchyDetail?.data.id) {
			const dataWithTag = { ...data, etag: hierarchyDetail.data.etag };
			dispatch(hierarchyActions.updateHierarchy({
				...dataWithTag,
				id: hierarchyDetail.data.id,
			}));
		}
	};

	const handleDelete = () => {
		if (hierarchyDetail?.data.id) {
			dispatch(hierarchyActions.deleteHierarchy(hierarchyDetail.data.id));
		}
	};

	React.useEffect(() => {
		if (!hierarchyId || !activeOrg) return;

		dispatch(hierarchyActions.getHierarchy(hierarchyId));
		dispatch(userActions.listUsers(activeOrg!.id));
	}, [hierarchyId, activeOrg, dispatch]);

	return {
		isLoadingDetail,
		handleDelete,
		handleUpdate,
	};
}


export function useHierarchyUserManagement() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const activeOrg = useActiveOrgWithDetails();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const hierarchyDetail = useMicroAppSelector(selectHierarchyDetail);
	const manageUsersCommand = useMicroAppSelector(selectManageHierarchyUsers);
	const isLoadingManageUsers = manageUsersCommand.status === 'pending';

	React.useEffect(() => {
		if (manageUsersCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.hierarchy.messages.manageUsersSuccess'), '',
			);
			dispatch(hierarchyActions.resetManageUsers());
			dispatch(userActions.listUsers(activeOrg!.id));
		}
		if (manageUsersCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.hierarchy.messages.manageUsersError'), '',
			);
			dispatch(hierarchyActions.resetManageUsers());
		}
	}, [manageUsersCommand.status, manageUsersCommand.error, notification, t, dispatch, activeOrg]);

	const handleAddUsers = (userIds: string[]) => {
		if ((userIds).length === 0) return;

		dispatch(hierarchyActions.manageHierarchyUsers({
			id: hierarchyDetail!.data.id,
			add: userIds,
			etag: hierarchyDetail!.data.etag,
		}));
	};

	const handleRemoveUsers = (userIds: string[]) => {
		if ((userIds).length === 0) return;

		dispatch(hierarchyActions.manageHierarchyUsers({
			id: hierarchyDetail!.data.id,
			remove: userIds,
			etag: hierarchyDetail!.data.etag,
		}));
	};

	return {
		isLoadingManageUsers,
		handleAddUsers,
		handleRemoveUsers,
	};
}
