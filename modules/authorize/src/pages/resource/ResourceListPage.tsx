import { Breadcrumbs, Button, Group, Paper, Stack, TagsInput, Typography } from '@mantine/core';
import { AutoTable, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';

import { AuthorizeDispatch, resourceActions, selectResourceState } from '../../appState';
import resourceSchema from '../../features/resources/resource-schema.json';


function ResourceListPageBody(): React.ReactNode {
	const { resources, isLoadingList } = useMicroAppSelector(selectResourceState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const schema = resourceSchema as ModelSchema;
	const columns = ['name', 'description', 'resourceType', 'scopeType', 'actionsCount'];

	React.useEffect(() => {
		dispatch(resourceActions.listResources());
	}, [dispatch]);

	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{
					minWidth: '30%',
				}}>
					<Typography>
						<h4>Resources</h4>
					</Typography>
				</Breadcrumbs>
				<TagsInput
					placeholder='Search'
					w='500px'
				/>
			</Group>
			<Group>
				<Button size='compact-md' leftSection={<IconPlus size={16} />}>Create</Button>
				<Button
					size='compact-md'
					variant='outline'
					leftSection={<IconRefresh size={16} />}
					onClick={() => dispatch(resourceActions.listResources())}
				>
					Refresh
				</Button>
				<Button size='compact-md' variant='outline' leftSection={<IconUpload size={16} />}>Import</Button>
			</Group>
			<Paper className='p-4'>
				<AutoTable
					columns={columns}
					columnAsLink='name'
					data={resources}
					schema={schema}
					isLoading={isLoadingList}
				/>
			</Paper>
		</Stack>
	);
}

export const ResourceListPage: React.FC = withWindowTitle('Resources', ResourceListPageBody);
