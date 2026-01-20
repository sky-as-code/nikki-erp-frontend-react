import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';
import { IdentityDispatch, userActions } from '../../../appState';
import { selectDeleteUser, selectUpdateUser } from '../../../appState/user';

// eslint-disable-next-line max-lines-per-function
export function useUserDetailHandlers(userId: string, etag: string) {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t } = useTranslation();

	const updateCommand = useMicroAppSelector(selectUpdateUser);
	const deleteCommand = useMicroAppSelector(selectDeleteUser);

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
		if (userId) {
			const dataWithTag = { ...data, etag };
			dispatch(userActions.updateUser({ id: userId, ...dataWithTag }));
		}
	};

	const handleDelete = () => {
		if (userId) {
			dispatch(userActions.deleteUser(userId));
		}
	};

	React.useEffect(() => {
		if (userId) {
			dispatch(userActions.getUser(userId));
		}
	}, [userId, dispatch]);

	return {
		handleDelete,
		handleUpdate,
	};
}
