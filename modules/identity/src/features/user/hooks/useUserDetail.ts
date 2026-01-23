import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { IdentityDispatch, userActions } from '../../../appState';
import { selectDeleteUser, selectUpdateUser, selectUserDetail } from '../../../appState/user';

// eslint-disable-next-line max-lines-per-function
export function useUserDetailHandlers() {
	const { userId } = useParams();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();
	const userDetail = useMicroAppSelector(selectUserDetail);

	const updateCommand = useMicroAppSelector(selectUpdateUser);
	const deleteCommand = useMicroAppSelector(selectDeleteUser);
	const isLoadingDetail = updateCommand.status === 'pending' || deleteCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.user.messages.updateSuccess'), '',
			);
			dispatch(userActions.resetUpdateUser());
			navigate('..', { relative: 'path' });
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.user.messages.updateError'), '',
			);
			dispatch(userActions.resetUpdateUser());
		}
	}, [updateCommand.status, dispatch, navigate, notification, t]);

	React.useEffect(() => {
		if (deleteCommand.status === 'success') {
			notification.showInfo(
				t('nikki.identity.user.messages.deleteSuccess'), '',
			);
			dispatch(userActions.resetDeleteUser());
			navigate('..', { relative: 'path' });
		}

		if (deleteCommand.status === 'error') {
			notification.showError(
				t('nikki.identity.user.messages.deleteError'), '',
			);
			dispatch(userActions.resetDeleteUser());
		}
	}, [deleteCommand.status, dispatch, navigate, notification, t]);

	const handleUpdate = (data: any) => {
		if (userDetail?.data.id) {
			const dataWithTag = { ...data, etag: userDetail.data.etag };
			dispatch(userActions.updateUser({ id: userDetail.data.id, ...dataWithTag }));
		}
	};

	const handleDelete = () => {
		if (userDetail?.data.id) {
			dispatch(userActions.deleteUser(userDetail.data.id));
		}
	};

	React.useEffect(() => {
		if (!userId) return;

		dispatch(userActions.getUser(userId));
	}, [userId, dispatch]);

	return {
		isLoadingDetail,
		handleDelete,
		handleUpdate,
	};
}
