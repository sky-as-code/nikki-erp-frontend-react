import { Paper } from '@mantine/core';
import { AutoTable, withWindowTitle } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/appState';
import React from 'react';

import { IdentityDispatch, userActions, selectUserState } from '../appState';
import userSchema from '../user-schema.json';


export const UserListPageBody: React.FC = () => {
	const { users, isLoadingList } = useMicroAppSelector(selectUserState);
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const schema = userSchema as ModelSchema;
	const columns = ['id', 'email', 'dateOfBirth', 'dependantNum', 'gender', 'nationality'];

	React.useEffect(() => {
		dispatch(userActions.listUsers());
	}, [dispatch]);

	return (
		<Paper className='p-4'>
			<AutoTable
				columns={columns}
				columnAsLink='email'
				data={users}
				schema={schema}
				isLoading={isLoadingList}
			/>
		</Paper>
	);
};


export const UserListPage: React.FC = withWindowTitle('User List', UserListPageBody);
