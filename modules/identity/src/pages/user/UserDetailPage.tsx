import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, userActions } from '../../appState';
import { selectUserState } from '../../appState/user';
import { HeaderDetailPage } from '../../components/HeaderDetailPage/HeaderDetailPage ';
import { UserDetailForm } from '../../features/user/components';
import userSchema from '../../schemas/user-schema.json';


function useUserDetailHandlers(userId: string, etag: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const handleUpdate = React.useCallback((data: any) => {
		const dataWithTag = { ...data, etag };
		dispatch(userActions.updateUser({ id: userId, ...dataWithTag }))
			.unwrap()
			.then(() => {
				notification.showInfo(t('nikki.identity.user.messages.updateSuccess'), '');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError(t('nikki.identity.user.messages.updateError'), '');
			});
	}, [userId, dispatch, etag, navigate, notification]);

	const handleDelete = React.useCallback(() => {
		dispatch(userActions.deleteUser(userId))
			.unwrap()
			.then(() => {
				notification.showInfo(t('nikki.identity.user.messages.deleteSuccess'), '');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError(t('nikki.identity.user.messages.deleteError'), '');
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
