import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useParams, useNavigate } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, groupActions, userActions, selectUserState } from '../../appState';
import { selectGroupState } from '../../appState/group';
import { HeaderDetailPage } from '../../components/HeaderDetailPage/HeaderDetailPage ';
import { ListUser } from '../../features/groups';
import { GroupDetailForm } from '../../features/groups/components';
import groupSchema from '../../schemas/group-schema.json';


function useGroupDetailHandlers(groupId: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { groupDetail } = useMicroAppSelector(selectGroupState);
	const { orgSlug } = useParams<{ orgSlug: string }>();
	const { notification } = useUIState();

	const handleUpdate = React.useCallback((data: any) => {
		const updatePayload = {
			id: groupId,
			...data,
			etag: groupDetail?.etag,
		};
		dispatch(groupActions.updateGroup(updatePayload))
			.unwrap()
			.then(() => {
				notification.showInfo('Group updated successfully', 'Success');
			})
			.catch(() => {
				notification.showError('Failed to update group. Please try again.', 'Error');
			});
	}, [groupId, dispatch, groupDetail?.etag, notification]);

	const handleDelete = React.useCallback(() => {
		dispatch(groupActions.deleteGroup(groupId))
			.unwrap()
			.then(() => {
				notification.showInfo('Group deleted successfully', 'Success');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError('Failed to delete group. Please try again.', 'Error');
			});
	}, [groupId, dispatch, navigate, notification]);

	React.useEffect(() => {
		if (groupId) {
			dispatch(groupActions.getGroup(groupId));
			dispatch(userActions.listUsersByGroupId(groupId));
			dispatch(userActions.listUsers(orgSlug!));
		}
	}, [groupId, dispatch, orgSlug]);

	return {
		handleUpdate,
		handleDelete,
	};
}

function useGroupUserManagement(groupId: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { groupDetail } = useMicroAppSelector(selectGroupState);
	const { notification } = useUIState();

	const handleAddUsers = React.useCallback((userIds: string[]) => {
		if (!groupDetail?.etag) return Promise.resolve();

		return dispatch(groupActions.manageGroupUsers({
			groupId,
			add: userIds,
			etag: groupDetail.etag,
		}))
			.unwrap()
			.then(() => {
				notification.showInfo('Users added successfully', 'Success');
				return Promise.all([
					dispatch(groupActions.getGroup(groupId)),
					dispatch(userActions.listUsersByGroupId(groupId)),
				]);
			})
			.then(() => { })
			.catch(() => {
				notification.showError('Failed to add users. Please try again.', 'Error');
			});
	}, [groupId, groupDetail?.etag, dispatch, notification]);

	const handleRemoveUsers = React.useCallback((userIds: string[]) => {
		if (!groupDetail?.etag) return Promise.resolve();

		return dispatch(groupActions.manageGroupUsers({
			groupId,
			remove: userIds,
			etag: groupDetail.etag,
		}))
			.unwrap()
			.then(() => {
				notification.showInfo('Users removed successfully', 'Success');
				return Promise.all([
					dispatch(groupActions.getGroup(groupId)),
					dispatch(userActions.listUsersByGroupId(groupId)),
				]);
			})
			.then(() => { })
			.catch(() => {
				notification.showError('Failed to remove users. Please try again.', 'Error');
			});
	}, [groupId, groupDetail?.etag, dispatch, notification]);

	return {
		handleAddUsers,
		handleRemoveUsers,
	};
}

export const GroupDetailPageBody: React.FC = () => {
	const { groupId } = useParams();
	const { groupDetail, isLoadingDetail, isUpdatingGroup, isManagingUsers } = useMicroAppSelector(selectGroupState);
	const { users, usersByGroup, isLoadingUsersByGroup } = useMicroAppSelector(selectUserState);
	const schema = groupSchema as ModelSchema;

	const { handleUpdate, handleDelete } = useGroupDetailHandlers(groupId!);
	const { handleAddUsers, handleRemoveUsers } = useGroupUserManagement(groupId!);

	const listUsersByGroupId = React.useMemo(() => {
		return usersByGroup.map((user: any) => ({
			id: user.id,
			email: user.email || '',
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
			status: user.status,
		}));
	}, [usersByGroup]);

	const availableUsers = React.useMemo(() => {
		return users.map((user: any) => ({
			id: user.id,
			email: user.email,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl || undefined,
		}));
	}, [users]);

	return (
		<Stack gap='md'>
			<HeaderDetailPage
				title='nikki.identity.group.detail.title'
				name={groupDetail?.name} />
			<GroupDetailForm
				schema={schema}
				groupDetail={groupDetail}
				isLoading={isLoadingDetail || isUpdatingGroup}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
			<ListUser
				users={listUsersByGroupId}
				availableUsers={availableUsers}
				isLoading={isLoadingUsersByGroup || isManagingUsers}
				onAddUsers={handleAddUsers}
				onRemoveUsers={handleRemoveUsers}
			/>
		</Stack>
	);
};

export const GroupDetailPage: React.FC = withWindowTitle('Group Detail', GroupDetailPageBody);
