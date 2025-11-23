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

import { AuthorizeDispatch, entitlementActions, selectEntitlementState } from '../../appState';
import entitlementSchema from '../../features/entitlements/entitlement-schema.json';


type EntitlementSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

function useEntitlementForm() {
	const { entitlementId } = useParams();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { entitlementDetail, isLoadingDetail } = useMicroAppSelector(selectEntitlementState);
	const isCreate = entitlementId === 'new';

	React.useEffect(() => {
		if (!isCreate && entitlementId) {
			dispatch(entitlementActions.getEntitlement(entitlementId));
		}
	}, [entitlementId, isCreate, dispatch]);

	return {
		entitlementDetail,
		isLoadingDetail,
		isCreate,
	};
}

export const EntitlementFormPageBody: React.FC = () => {
	const navigate = useNavigate();
	const schema = entitlementSchema as EntitlementSchema;
	const { entitlementDetail, isLoadingDetail, isCreate } = useEntitlementForm();

	const onSubmit = (data: unknown) => {
		console.log('Form submitted:', data);
		// TODO: Dispatch create or update action
		// After success, navigate back to list
		// navigate('/entitlements');
	};

	return (
		<Stack gap='md'>
			<EntitlementFormHeader isCreate={isCreate} entitlementName={entitlementDetail?.name} />
			<EntitlementFormActions />
			<EntitlementFormContent
				schema={schema}
				isCreate={isCreate}
				entitlementDetail={entitlementDetail}
				isLoadingDetail={isLoadingDetail}
				onSubmit={onSubmit}
			/>
		</Stack>
	);
};

interface EntitlementFormHeaderProps {
	isCreate: boolean;
	entitlementName?: string;
}

function EntitlementFormHeader({ isCreate, entitlementName }: EntitlementFormHeaderProps): React.ReactNode {
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Typography>
					<h4><Link to='/entitlements'>Entitlements</Link></h4>
				</Typography>
				<Typography>
					<h5>{isCreate ? 'Create Entitlement' : `Edit: ${entitlementName || ''}`}</h5>
				</Typography>
			</Breadcrumbs>
		</Group>
	);
}

function EntitlementFormActions(): React.ReactNode {
	return (
		<Group>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconArrowLeft size={16} />}
				component={Link}
				to='/entitlements'
			>
				Back
			</Button>
		</Group>
	);
}

interface EntitlementFormContentProps {
	schema: EntitlementSchema;
	isCreate: boolean;
	entitlementDetail: unknown;
	isLoadingDetail: boolean;
	onSubmit: (data: unknown) => void;
}

function EntitlementFormContent({
	schema,
	isCreate,
	entitlementDetail,
	isLoadingDetail,
	onSubmit,
}: EntitlementFormContentProps): React.ReactNode {
	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant={isCreate ? 'create' : 'update'}
				modelSchema={schema}
				modelValue={isCreate ? undefined : entitlementDetail}
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
							<AutoField name='actionId' />
							<AutoField name='resourceId' />
							<AutoField name='actionExpr' />
							<AutoField name='scopeRef' />
							<AutoField name='orgId' />
							{!isCreate && (
								<>
									<AutoField name='assignmentsCount' htmlProps={{
										readOnly: true,
									}} />
									<AutoField name='rolesCount' htmlProps={{
										readOnly: true,
									}} />
								</>
							)}
							<Group mt='xl'>
								<Button type='submit' leftSection={<IconCheck size={16} />}>
									{isCreate ? 'Create' : 'Update'}
								</Button>
								<Button
									type='button'
									variant='outline'
									component={Link}
									to='/entitlements'
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

export const EntitlementFormPage: React.FC = withWindowTitle('Entitlement Form', EntitlementFormPageBody);

