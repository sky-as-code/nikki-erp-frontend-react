import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, userActions } from '../../appState';
import { selectUserState } from '../../appState/user';
import { HeaderDetailPage } from '../../components/HeaderDetailPage/HeaderDetailPage ';
import { UserDetailForm } from '../../features/users/components';
import userSchema from '../../schemas/user-schema.json';


function useUserDetailHandlers(userId: string, etag: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();

	const handleUpdate = React.useCallback((data: any) => {
		const dataWithTag = { ...data, etag };
		dispatch(userActions.updateUser({ id: userId, ...dataWithTag }))
			.unwrap()
			.then(() => {
				notification.showInfo('User updated successfully', 'Success');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError('Failed to update user. Please try again.', 'Error');
			});
	}, [userId, dispatch, etag, navigate, notification]);

	const handleDelete = React.useCallback(() => {
		dispatch(userActions.deleteUser(userId))
			.unwrap()
			.then(() => {
				notification.showInfo('User deleted successfully', 'Success');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError('Failed to delete user. Please try again.', 'Error');
			});
	}, [userId, dispatch, navigate, notification]);

	React.useEffect(() => {
		dispatch(userActions.getUser(userId!));
	}, [userId, dispatch]);

	return {
		handleDelete,
		handleUpdate,
	};
}

export const UserDetailPageBody: React.FC = () => {
	const { userId } = useParams();
	const { userDetail, isLoadingDetail } = useMicroAppSelector(selectUserState);
	const schema = userSchema as ModelSchema;

	const handlers = useUserDetailHandlers(userId!, userDetail?.etag);

	return (
		<Stack gap='md'>
			<HeaderDetailPage
				title='nikki.identity.user.title'
				name={userDetail?.email} />
			<UserDetailForm
				schema={schema}
				userDetail={userDetail}
				isLoading={isLoadingDetail}
				onSubmit={handlers.handleUpdate}
				onDelete={handlers.handleDelete}
			/>
		</Stack>
	);
};

export const UserDetailPage: React.FC = withWindowTitle('User Detail', UserDetailPageBody);
