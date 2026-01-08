import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { IdentityDispatch, userActions, selectUserState } from '../../appState';
import { HeaderListPage } from '../../components/HeaderListPage/HeaderListPage';
import { ListActionListPage } from '../../components/ListActionBar';
import { UserTable } from '../../features/user/components';
import userSchema from '../../schemas/user-schema.json';


function useUserListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { orgSlug } = useParams<{ orgSlug: string }>();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(userActions.listUsers(orgSlug!));
	}, [dispatch, orgSlug]);

	React.useEffect(() => {
		dispatch(userActions.listUsers(orgSlug!));
	}, [dispatch, orgSlug]);

	return {
		handleCreate,
		handleRefresh,
	};
}

export function UserListPageBody(): React.ReactElement {
	const { users, isLoadingList } = useMicroAppSelector(selectUserState);
	const schema = userSchema as ModelSchema;
	const columns = ['avatar', 'email', 'displayName', 'status', 'groups', 'createdAt', 'updatedAt'];

	const { handleCreate, handleRefresh } = useUserListHandlers();


	return (
		<Stack gap='md'>
			<HeaderListPage
				title='nikki.identity.user.title'
				searchPlaceholder='nikki.identity.user.searchPlaceholder'
			/>
			<ListActionListPage
				onCreate={handleCreate}
				onRefresh={handleRefresh}
			/>
			<UserTable
				columns={columns}
				users={users}
				isLoading={isLoadingList}
				schema={schema}
			/>
		</Stack>
	);
}

export const UserListPage: React.FC = withWindowTitle('User List', UserListPageBody);
