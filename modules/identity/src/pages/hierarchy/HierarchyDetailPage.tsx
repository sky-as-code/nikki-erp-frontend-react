import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, hierarchyActions, userActions, selectUserState } from '../../appState';
import { selectHierarchyState } from '../../appState/hierarchy';
import { HeaderDetailPage } from '../../components/HeaderDetailPage/HeaderDetailPage ';
import { ListUser } from '../../components/User';
import { HierarchyDetailForm } from '../../features/hierarchy/components';
import hierarchySchema from '../../schemas/hierarchy-schema.json';


function useHierarchyDetailHandlers(hierarchyId: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { hierarchyDetail } = useMicroAppSelector(selectHierarchyState);
	const { orgSlug } = useParams<{ orgSlug: string }>();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const handleUpdate = React.useCallback((data: any) => {
		const updatePayload = {
			id: hierarchyId,
			...data,
			etag: hierarchyDetail?.etag,
		};
		dispatch(hierarchyActions.updateHierarchy(updatePayload))
			.unwrap()
			.then(() => {
				notification.showInfo(t('nikki.identity.hierarchy.messages.updateSuccess'), '');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError(t('nikki.identity.hierarchy.messages.updateError'), '');
			});
	}, [hierarchyId, dispatch, hierarchyDetail?.etag, notification]);

	const handleDelete = React.useCallback(() => {
		dispatch(hierarchyActions.deleteHierarchy(hierarchyId))
			.unwrap()
			.then(() => {
				notification.showInfo(t('nikki.identity.hierarchy.messages.deleteSuccess'), '');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError(t('nikki.identity.hierarchy.messages.deleteError'), '');
			});
	}, [hierarchyId, dispatch, navigate, notification]);

	React.useEffect(() => {
		if (hierarchyId) {
			dispatch(hierarchyActions.getHierarchy(hierarchyId));
			dispatch(userActions.listUsers(orgSlug!));
		}
	}, [hierarchyId, dispatch, orgSlug]);

	return {
		handleUpdate,
		handleDelete,
	};
}

function useHierarchyUserManagement(hierarchyId: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { hierarchyDetail } = useMicroAppSelector(selectHierarchyState);
	const { orgSlug } = useParams<{ orgSlug: string }>();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const handleAddUsers = React.useCallback((userIds: string[]) => {
		if (!hierarchyDetail?.etag) return Promise.resolve();

		return dispatch(hierarchyActions.manageHierarchyUsers({
			hierarchyId,
			add: userIds,
			etag: hierarchyDetail.etag,
		}))
			.unwrap()
			.then(() => {
				notification.showInfo(t('nikki.identity.hierarchy.messages.addUsersSuccess'), '');
				return Promise.all([
					dispatch(hierarchyActions.getHierarchy(hierarchyId)),
					dispatch(userActions.listUsers(orgSlug!)),
				]);
			})
			.then(() => { })
			.catch(() => {
				notification.showError(t('nikki.identity.hierarchy.messages.addUsersError'), '');
			});
	}, [hierarchyId, hierarchyDetail?.etag, dispatch, orgSlug, notification]);

	const handleRemoveUsers = React.useCallback((userIds: string[]) => {
		if (!hierarchyDetail?.etag) return Promise.resolve();

		return dispatch(hierarchyActions.manageHierarchyUsers({
			hierarchyId,
			remove: userIds,
			etag: hierarchyDetail.etag,
		}))
			.unwrap()
			.then(() => {
				notification.showInfo(t('nikki.identity.hierarchy.messages.removeUsersSuccess'), '');
				return Promise.all([
					dispatch(hierarchyActions.getHierarchy(hierarchyId)),
					dispatch(userActions.listUsers(orgSlug!)),
				]);
			})
			.then(() => { })
			.catch(() => {
				notification.showError(t('nikki.identity.hierarchy.messages.removeUsersError'), '');
			});
	}, [hierarchyId, hierarchyDetail?.etag, dispatch, orgSlug, notification]);

	return {
		handleAddUsers,
		handleRemoveUsers,
	};
}

export const HierarchyDetailPageBody: React.FC = () => {
	const { hierarchyId } = useParams();
	const {
		hierarchyDetail,
		isLoadingDetail,
		isUpdatingHierarchy,
		isManagingUsers,
	} = useMicroAppSelector(selectHierarchyState);
	const { users, isLoadingList } = useMicroAppSelector(selectUserState);
	const schema = hierarchySchema as ModelSchema;
	const { t } = useTranslation();

	const { handleUpdate, handleDelete } = useHierarchyDetailHandlers(hierarchyId!);
	const { handleAddUsers, handleRemoveUsers } = useHierarchyUserManagement(hierarchyId!);

	const hierarchyUsers = React.useMemo(() => {
		// Filter users that have hierarchy.id matching hierarchyId
		return users
			.filter((user: any) => user.hierarchy?.id === hierarchyId)
			.map((user: any) => ({
				id: user.id,
				email: user.email || '',
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
				status: user.status,
			}));
	}, [users, hierarchyId]);

	const availableUsers = React.useMemo(() => {
		// Filter users that DON'T have hierarchy.id matching hierarchyId
		return users
			.filter((user: any) => user.hierarchy?.id !== hierarchyId)
			.map((user: any) => ({
				id: user.id,
				email: user.email,
				displayName: user.displayName,
				avatarUrl: user.avatarUrl,
			}));
	}, [users, hierarchyId]);

	return (
		<Stack gap='md'>
			<HeaderDetailPage
				title='nikki.identity.hierarchy.title'
				name={hierarchyDetail?.name} />
			<HierarchyDetailForm
				schema={schema}
				hierarchyDetail={hierarchyDetail}
				isLoading={isLoadingDetail || isUpdatingHierarchy}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
			<ListUser
				users={hierarchyUsers}
				availableUsers={availableUsers}
				isLoading={isLoadingList || isManagingUsers}
				onAddUsers={handleAddUsers}
				onRemoveUsers={handleRemoveUsers}
				title={t('nikki.identity.hierarchy.title')}
				emptyMessage={t('nikki.identity.hierarchy.messages.noHierarchies')}
			/>
		</Stack>
	);
};

export const HierarchyDetailPage: React.FC = withWindowTitle('Hierarchy Detail', HierarchyDetailPageBody);
