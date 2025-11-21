import {
	Breadcrumbs,
	Button,
	Group,
	Stack,
	Typography,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import {
	FormStyleProvider, FormFieldProvider, AutoField,
} from '@nikkierp/ui/components/form';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import { IconArchive, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { Link, useParams } from 'react-router';

import { AuthorizeDispatch, resourceActions, selectResourceState } from '../../appState';
import resourceSchema from '../../features/resources/resource-schema.json';


type ResourceSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

export const ResourceDetailPageBody: React.FC = () => {
	const { resourceId } = useParams();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resourceDetail, isLoadingDetail } = useMicroAppSelector(selectResourceState);
	const schema = resourceSchema as ResourceSchema;

	React.useEffect(() => {
		if (resourceId) {
			dispatch(resourceActions.getResource(resourceId));
		}
	}, [resourceId, dispatch]);

	const onSubmit = (data: unknown) => {
		console.log('Form submitted:', data);
	};

	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{
					minWidth: '30%',
				}}>
					<Typography>
						<h4><Link to='../resources'>Resources</Link></h4>
					</Typography>
					<Typography>
						<h5>{resourceDetail?.name}</h5>
					</Typography>
				</Breadcrumbs>
			</Group>
			<Group>
				<Button leftSection={<IconPlus size={16} />} size='compact-md'>Create</Button>
				<Button leftSection={<IconRefresh size={16} />} size='compact-md' variant='outline'disabled={isLoadingDetail} onClick={() => resourceId && dispatch(resourceActions.getResource(resourceId))}>
					Refresh
				</Button>
				<Button leftSection={<IconTrash size={16} />} size='compact-md' variant='outline' disabled={isLoadingDetail}>Delete</Button>
				<Button leftSection={<IconArchive size={16} />} size='compact-md' variant='outline' disabled={isLoadingDetail}>Archive</Button>
			</Group>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={schema}
					modelValue={resourceDetail}
					modelLoading={isLoadingDetail}
				>
					{({ handleSubmit }) => (
						<form onSubmit={handleSubmit(onSubmit)} noValidate>
							<Stack gap='xs'>
								<AutoField name='id' />
								<AutoField name='name' autoFocused inputProps={{
									size: 'lg',
								}} />
								<AutoField name='description' />
								<AutoField name='resourceType' />
								<AutoField name='scopeType' />
								<AutoField name='actionsCount' htmlProps={{
									readOnly: true,
								}} />
								<Button type='submit' mt='xl'>
									Submit
								</Button>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Stack>
	);
};

export const ResourceDetailPage: React.FC = withWindowTitle('Resource Detail', ResourceDetailPageBody);
