import {
	Button,
	Group,
	Stack,
} from '@mantine/core';
import { FormDialog } from '@nikkierp/ui/components';
import { AutoField } from '@nikkierp/ui/components/form';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import { IconCheck } from '@tabler/icons-react';
import React from 'react';

import { AuthorizeDispatch, resourceActions } from '../../appState';
import resourceSchema from '../../features/resources/resource-schema.json';
import { Resource } from '../../features/resources/types';


type ResourceSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

export interface ResourceFormDialogProps {
	opened: boolean;
	mode: 'create' | 'edit';
	resource?: Resource;
	onClose: () => void;
}

export const ResourceFormDialog: React.FC<ResourceFormDialogProps> = (props) => {
	const schema = resourceSchema as ResourceSchema;
	const handlers = useResourceFormHandlers(props);

	return (
		<FormDialog
			opened={props.opened}
			onClose={() => handlers.safeClose()}
			title={handlers.dialogTitle}
			formVariant={handlers.isCreate ? 'create' : 'update'}
			modelSchema={schema}
			modelValue={handlers.dialogModelValue}
			modelLoading={handlers.isSubmitting}
		>
			{({ handleSubmit }) => (
				<form onSubmit={handleSubmit(handlers.submit)} noValidate>
					<Stack gap='xs'>
						{!handlers.isCreate && <AutoField name='id' />}
						<AutoField name='name' autoFocused inputProps={{
							size: 'lg',
						}} />
						<AutoField name='description' />
						<AutoField name='resourceType' />
						<AutoField name='scopeType' />
						<AutoField name='scopeRef' />
						<AutoField name='resourceRef' />
						{!handlers.isCreate && (
							<AutoField name='actionsCount' htmlProps={{
								readOnly: true,
							}} />
						)}
						<Group mt='xl'>
							<Button
								type='submit'
								leftSection={<IconCheck size={16} />}
								loading={handlers.isSubmitting}
							>
								{handlers.isCreate ? 'Create' : 'Update'}
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={handlers.safeClose}
								disabled={handlers.isSubmitting}
							>
								Cancel
							</Button>
						</Group>
					</Stack>
				</form>
			)}
		</FormDialog>
	);
};

function useResourceFormHandlers(props: ResourceFormDialogProps) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const isCreate = props.mode === 'create';
	const dialogTitle = isCreate ? 'Create Resource' : `Edit: ${props.resource?.name ?? ''}`;
	const dialogModelValue = React.useMemo(
		() => (isCreate ? undefined : props.resource as unknown as Record<string, unknown>),
		[isCreate, props.resource],
	);

	const submit = React.useCallback(async (data: unknown) => {
		const formData = data as Partial<Resource>;
		setIsSubmitting(true);
		try {
			if (isCreate) {
				await dispatch(resourceActions.createResource({
					name: formData.name!,
					description: formData.description,
					resourceType: formData.resourceType!,
					resourceRef: formData.resourceRef,
					scopeType: formData.scopeType!,
					scopeRef: formData.scopeRef,
					createdBy: formData.createdBy || 'system',
				})).unwrap();
			}
			else if (props.resource) {
				await dispatch(resourceActions.updateResource({
					id: props.resource.id,
					resource: {
						name: formData.name,
						description: formData.description,
						resourceType: formData.resourceType,
						resourceRef: formData.resourceRef,
						scopeType: formData.scopeType,
						scopeRef: formData.scopeRef,
					},
					etag: props.resource.etag,
				})).unwrap();
			}
			props.onClose();
		}
		catch (error) {
			console.error('Failed to submit resource form', error);
		}
		finally {
			setIsSubmitting(false);
		}
	}, [dispatch, isCreate, props]);

	const safeClose = React.useCallback(() => {
		if (!isSubmitting) {
			props.onClose();
		}
	}, [isSubmitting, props]);

	return {
		isCreate,
		isSubmitting,
		dialogTitle,
		dialogModelValue,
		submit,
		safeClose,
	};
}

