import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { IdentityDispatch, hierarchyActions, userActions } from '../../../appState';
import { selectDeleteHierarchy, selectHierarchyState, selectManageHierarchyUsers, selectUpdateHierarchy } from '../../../appState/hierarchy';

// eslint-disable-next-line max-lines-per-function
export function useHierarchyDetailHandlers(hierarchyId: string, etag: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const updateCommand = useMicroAppSelector(selectUpdateHierarchy);
	const deleteCommand = useMicroAppSelector(selectDeleteHierarchy);

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
		if (hierarchyId) {
			dispatch(hierarchyActions.updateHierarchy({
				...data,
				id: hierarchyId,
				etag,
			}));
		}
	};

	const handleDelete = () => {
		if (hierarchyId) {
			dispatch(hierarchyActions.deleteHierarchy(hierarchyId));
		}
	};

	return {
		handleDelete,
		handleUpdate,
	};
}

// eslint-disable-next-line max-lines-per-function
export function useHierarchyUserManagement(hierarchyId: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { hierarchyDetail } = useMicroAppSelector(selectHierarchyState);
	const activeOrg = useActiveOrgWithDetails();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const manageUsersCommand = useMicroAppSelector(selectManageHierarchyUsers);

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
		}
	}, [manageUsersCommand.status, manageUsersCommand.error, notification, t, dispatch, activeOrg]);

	const handleAddUsers = (userIds: string[]) => {
		if ((userIds).length === 0) return;

		dispatch(hierarchyActions.manageHierarchyUsers({
			id: hierarchyId,
			add: userIds,
			etag: hierarchyDetail?.etag || '',
		}));
	};

	const handleRemoveUsers = (userIds: string[]) => {
		if ((userIds).length === 0) return;

		dispatch(hierarchyActions.manageHierarchyUsers({
			id: hierarchyId,
			remove: userIds,
			etag: hierarchyDetail?.etag || '',
		}));
	};

	React.useEffect(() => {
		if (hierarchyId) {
			dispatch(hierarchyActions.getHierarchy(hierarchyId));
		}
	}, [hierarchyId, dispatch]);

	return {
		handleAddUsers,
		handleRemoveUsers,
	};
}
