import { ActionIcon, Anchor, Breadcrumbs, Button, Group, Paper, Stack, TagsInput, Tooltip, Typography } from '@mantine/core';
import { AutoTable, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconTrash, IconEdit, IconEye, IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';
import { Link, useNavigate } from 'react-router';

import { IdentityDispatch, userActions, selectUserState } from '../../appState';
import userSchema from '../../user-schema.json';


function UserListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { users, isLoadingList } = useMicroAppSelector(selectUserState);
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const schema = userSchema as ModelSchema;
	const columns = ['id', 'email', 'dateOfBirth', 'dependantNum', 'gender', 'nationality', 'actions'];

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
					columnRenderers={{
						actions: (row: Record<string, any>) => (
							<Group gap='xs'>
								<Anchor component={Link} to={`./${row.id}`}>
									<IconEdit size={16} />
								</Anchor>
								<Anchor component={Link} to={`./${row.id}/edit`}>
									<IconEye size={16} />
								</Anchor>
								<Anchor component={Link} to={`./${row.id}/delete`}>
									<IconTrash size={16} />
								</Anchor>
							</Group>
						),
					}}
				/>
			</Paper>
		</Stack>
	);
}

export const UserListPage: React.FC = withWindowTitle('User List', UserListPageBody);
