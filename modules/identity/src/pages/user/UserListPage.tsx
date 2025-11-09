import { Breadcrumbs, Button, Group, Paper, Stack, TagsInput, Typography } from '@mantine/core';
import { AutoTable, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';

import { IdentityDispatch, userActions, selectUserState } from '../../appState';
import userSchema from '../../user-schema.json';


function UserListPageBody(): React.ReactNode {
	const { users, isLoadingList } = useMicroAppSelector(selectUserState);
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const schema = userSchema as ModelSchema;
	const columns = ['id', 'email', 'dateOfBirth', 'dependantNum', 'gender', 'nationality'];

	React.useEffect(() => {
		dispatch(userActions.listUsers());
	}, [dispatch]);

	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{
					minWidth: '30%',
				}}>
					<Typography>
						<h4>Users</h4>
					</Typography>
				</Breadcrumbs>
				<TagsInput
					placeholder='Search'
					w='500px'
				/>
			</Group>
			<Group>
				<Button size='compact-md' leftSection={<IconPlus size={16} />}>Create</Button>
				<Button size='compact-md' variant='outline' leftSection={<IconRefresh size={16} />}>Refresh</Button>
				<Button size='compact-md' variant='outline' leftSection={<IconUpload size={16} />}>Import</Button>
			</Group>
			<Paper className='p-4'>
				<AutoTable
					columns={columns}
					columnAsLink='email'
					data={users}
					schema={schema}
					isLoading={isLoadingList}
				/>
			</Paper>
		</Stack>
	);
}

export const UserListPage: React.FC = withWindowTitle('User List', UserListPageBody);
