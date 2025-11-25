import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, userActions, selectUserState } from '../../appState';
import { HeaderCreatePage } from '../../components/HeaderCreatePage/HeaderCreatePage';
import { UserCreateForm } from '../../features/users/components';
import userSchema from '../../schemas/user-schema.json';


function useUserCreateHandlers() {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { orgSlug } = useParams<{ orgSlug: string }>();

	const handleCreate = React.useCallback((data: any) => {
		dispatch(userActions.createUser({ orgSlug: orgSlug!, data }))
			.unwrap()
			.then(() => {
				notification.showInfo('User created successfully', 'Success');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError(`Failed to create user ${data.email}. Please try again.`, 'Error');
			});
	}, [dispatch, navigate, notification, orgSlug]);

	return {
		handleCreate,
	};
}

export const UserCreatePageBody: React.FC = () => {
	const { isCreatingUser } = useMicroAppSelector(selectUserState);
	const schema = userSchema as ModelSchema;

	const { handleCreate } = useUserCreateHandlers();

	return (
		<Stack gap='md'>
			<HeaderCreatePage title='nikki.identity.user.actions.createNew' />
			<UserCreateForm
				schema={schema}
				isCreatingUser={isCreatingUser}
				onSubmit={handleCreate}
			/>
		</Stack>
	);
};

export const UserCreatePage = withWindowTitle('Create User', UserCreatePageBody);