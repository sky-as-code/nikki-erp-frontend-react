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

import { AuthorizeDispatch, actionActions, selectActionState } from '../../appState';
import actionSchema from '../../features/actions/action-schema.json';


type ActionSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

function useActionForm() {
	const { actionId } = useParams();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { actionDetail, isLoadingDetail } = useMicroAppSelector(selectActionState);
	const isCreate = actionId === 'new';

	React.useEffect(() => {
		if (!isCreate && actionId) {
			dispatch(actionActions.getAction(actionId));
		}
	}, [actionId, isCreate, dispatch]);

	return {
		actionDetail,
		isLoadingDetail,
		isCreate,
	};
}

export const ActionFormPageBody: React.FC = () => {
	const navigate = useNavigate();
	const schema = actionSchema as ActionSchema;
	const { actionDetail, isLoadingDetail, isCreate } = useActionForm();

	const onSubmit = (data: unknown) => {
		console.log('Form submitted:', data);
		// TODO: Dispatch create or update action
		// After success, navigate back to list
		// navigate('/actions');
	};

	return (
		<Stack gap='md'>
			<ActionFormHeader isCreate={isCreate} actionName={actionDetail?.name} />
			<ActionFormActions />
			<ActionFormContent
				schema={schema}
				isCreate={isCreate}
				actionDetail={actionDetail}
				isLoadingDetail={isLoadingDetail}
				onSubmit={onSubmit}
			/>
		</Stack>
	);
};

interface ActionFormHeaderProps {
	isCreate: boolean;
	actionName?: string;
}

function ActionFormHeader({ isCreate, actionName }: ActionFormHeaderProps): React.ReactNode {
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Typography>
					<h4><Link to='/actions'>Actions</Link></h4>
				</Typography>
				<Typography>
					<h5>{isCreate ? 'Create Action' : `Edit: ${actionName || ''}`}</h5>
				</Typography>
			</Breadcrumbs>
		</Group>
	);
}

function ActionFormActions(): React.ReactNode {
	return (
		<Group>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconArrowLeft size={16} />}
				component={Link}
				to='/actions'
			>
				Back
			</Button>
		</Group>
	);
}

interface ActionFormContentProps {
	schema: ActionSchema;
	isCreate: boolean;
	actionDetail: unknown;
	isLoadingDetail: boolean;
	onSubmit: (data: unknown) => void;
}

function ActionFormContent({
	schema,
	isCreate,
	actionDetail,
	isLoadingDetail,
	onSubmit,
}: ActionFormContentProps): React.ReactNode {
	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant={isCreate ? 'create' : 'update'}
				modelSchema={schema}
				modelValue={isCreate ? undefined : actionDetail}
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
							<AutoField name='resourceId' />
							{!isCreate && (
								<AutoField name='entitlementsCount' htmlProps={{
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
									to='/actions'
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

export const ActionFormPage: React.FC = withWindowTitle('Action Form', ActionFormPageBody);

