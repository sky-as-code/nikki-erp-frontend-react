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
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, resourceActions, selectResourceState } from '../../appState';
import resourceSchema from '../../features/resources/resource-schema.json';


type ResourceSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

function useResourceForm() {
	const { resourceId } = useParams();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resourceDetail, isLoadingDetail } = useMicroAppSelector(selectResourceState);
	const isCreate = resourceId === 'new';

	React.useEffect(() => {
		if (!isCreate && resourceId) {
			dispatch(resourceActions.getResource(resourceId));
		}
	}, [resourceId, isCreate, dispatch]);

	return {
		resourceDetail,
		isLoadingDetail,
		isCreate,
	};
}

export const ResourceFormPageBody: React.FC = () => {
	const navigate = useNavigate();
	const schema = resourceSchema as ResourceSchema;
	const { resourceDetail, isLoadingDetail, isCreate } = useResourceForm();

	const onSubmit = (data: unknown) => {
		console.log('Form submitted:', data);
		// TODO: Dispatch create or update action
		// After success, navigate back to list
		// navigate('/resources');
	};

	return (
		<Stack gap='md'>
			<ResourceFormHeader isCreate={isCreate} resourceName={resourceDetail?.name} />
			<ResourceFormActions />
			<ResourceFormContent
				schema={schema}
				isCreate={isCreate}
				resourceDetail={resourceDetail}
				isLoadingDetail={isLoadingDetail}
				onSubmit={onSubmit}
			/>
		</Stack>
	);
};

interface ResourceFormHeaderProps {
	isCreate: boolean;
	resourceName?: string;
}

function ResourceFormHeader({ isCreate, resourceName }: ResourceFormHeaderProps): React.ReactNode {
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Typography>
					<h4><Link to='/resources'>Resources</Link></h4>
				</Typography>
				<Typography>
					<h5>{isCreate ? 'Create Resource' : `Edit: ${resourceName || ''}`}</h5>
				</Typography>
			</Breadcrumbs>
		</Group>
	);
}

function ResourceFormActions(): React.ReactNode {
	return (
		<Group>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconArrowLeft size={16} />}
				component={Link}
				to='/resources'
			>
				Back
			</Button>
		</Group>
	);
}

interface ResourceFormContentProps {
	schema: ResourceSchema;
	isCreate: boolean;
	resourceDetail: unknown;
	isLoadingDetail: boolean;
	onSubmit: (data: unknown) => void;
}

function ResourceFormContent({
	schema,
	isCreate,
	resourceDetail,
	isLoadingDetail,
	onSubmit,
}: ResourceFormContentProps): React.ReactNode {
	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant={isCreate ? 'create' : 'update'}
				modelSchema={schema}
				modelValue={isCreate ? undefined : resourceDetail}
				modelLoading={isCreate ? false : isLoadingDetail}
			>
				{({ handleSubmit }) => (
					<form onSubmit={handleSubmit(onSubmit)} noValidate>
						<Stack gap='xs'>
							{!isCreate && <AutoField name='id' />}
							<AutoField name='name' autoFocused inputProps={{
								size: 'lg',
							}} />
							<AutoField name='description' />
							<AutoField name='resourceType' />
							<AutoField name='scopeType' />
							{!isCreate && (resourceDetail as { scopeType?: string })?.scopeType === 'hierarchy' && (
								<AutoField name='scopeRef' />
							)}
							{!isCreate && (
								<AutoField name='actionsCount' htmlProps={{
									readOnly: true,
								}} />
							)}
							<Group mt='xl'>
								<Button type='submit' leftSection={<IconCheck size={16} />}>
									{isCreate ? 'Create' : 'Update'}
								</Button>
								<Button
									type='button'
									variant='outline'
									component={Link}
									to='/resources'
								>
									Cancel
								</Button>
							</Group>
						</Stack>
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}

export const ResourceFormPage: React.FC = withWindowTitle('Resource Form', ResourceFormPageBody);
