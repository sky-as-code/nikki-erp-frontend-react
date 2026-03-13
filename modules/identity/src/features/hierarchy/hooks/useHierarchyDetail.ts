import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { IdentityDispatch, hierarchyActions, userActions } from '../../../appState';
import { selectDeleteHierarchy, selectManageHierarchyUsers, selectUpdateHierarchy, selectHierarchyDetail } from '../../../appState/hierarchy';
import { useOrgScopeRef } from '../../../hooks';

// eslint-disable-next-line max-lines-per-function
export function useHierarchyDetailHandlers() {
	const { hierarchyId } = useParams();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const hierarchyDetail = useMicroAppSelector(selectHierarchyDetail);
	const orgScopeRef = useOrgScopeRef();

	const updateCommand = useMicroAppSelector(selectUpdateHierarchy);
	const deleteCommand = useMicroAppSelector(selectDeleteHierarchy);
	const isLoadingDetail = hierarchyDetail?.status ;

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
				data: {
					...dataWithTag,
					id: hierarchyDetail.data.id,
				},
				scopeRef: orgScopeRef,
			}));
		}
	};

	const handleDelete = () => {
		if (hierarchyDetail?.data.id) {
			dispatch(hierarchyActions.deleteHierarchy({ id: hierarchyDetail.data.id, scopeRef: orgScopeRef }));
		}
	};

	React.useEffect(() => {
		if (!hierarchyId) return;

		dispatch(hierarchyActions.getHierarchy({ id: hierarchyId, scopeRef: orgScopeRef }));
		dispatch(userActions.listUsers({ scopeRef: orgScopeRef }));
	}, [hierarchyId, orgScopeRef, dispatch]);

	return {
		isLoadingDetail,
		handleDelete,
		handleUpdate,
	};
}


// eslint-disable-next-line max-lines-per-function
export function useHierarchyUserManagement() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const orgScopeRef = useOrgScopeRef();
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
			if (hierarchyDetail?.data.id) {
				dispatch(userActions.listUsers({ scopeRef: hierarchyDetail.data.id }));
			}
		}
		if (manageUsersCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.hierarchy.messages.manageUsersError'), '',
			);
			dispatch(hierarchyActions.resetManageUsers());
		}
	}, [manageUsersCommand.status, manageUsersCommand.error, notification, t, dispatch, orgScopeRef]);

	const handleAddUsers = (userIds: string[]) => {
		if ((userIds).length === 0) return;

		dispatch(hierarchyActions.manageHierarchyUsers({
			data: {
				id: hierarchyDetail!.data.id,
				add: userIds,
				etag: hierarchyDetail!.data.etag,
			},
			scopeRef: orgScopeRef,
		}));
	};

	const handleRemoveUsers = (userIds: string[]) => {
		if ((userIds).length === 0) return;

		dispatch(hierarchyActions.manageHierarchyUsers({
			data: {
				id: hierarchyDetail!.data.id,
				remove: userIds,
				etag: hierarchyDetail!.data.etag,
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
