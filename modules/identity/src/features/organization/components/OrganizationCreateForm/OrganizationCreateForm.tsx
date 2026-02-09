import {
	Paper,
	Stack,
} from '@mantine/core';
import {
	FormStyleProvider,
	FormFieldProvider,
	AutoField,
} from '@nikkierp/ui/components/form';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import React from 'react';

import { ListActionCreatePage } from '../../../../components/ListActionBar';



type OrganizationSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface OrganizationCreateFormProps {
	schema: OrganizationSchema;
	isCreatingOrganization: boolean;
	onSubmit: (data: any) => void;
	canCreate?: boolean;
}

export function OrganizationCreateForm({
	schema,
	isCreatingOrganization,
	onSubmit,
	canCreate = true }: OrganizationCreateFormProps): React.ReactElement {
	return (
		<Paper withBorder p='xl'>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='create'
					modelSchema={schema}
				>
					{({ handleSubmit }) => (
						<form onSubmit={handleSubmit(onSubmit)} noValidate>
							<Stack gap='xl'>
								<Stack gap='md'>
									<AutoField name='displayName' inputProps={{ disabled: isCreatingOrganization }} />
									<AutoField name='legalName' inputProps={{ disabled: isCreatingOrganization }} />
									<AutoField name='phoneNumber' inputProps={{ disabled: isCreatingOrganization }} />
									<AutoField name='address' inputProps={{ disabled: isCreatingOrganization }} />
									<AutoField name='slug' inputProps={{ disabled: isCreatingOrganization }} />
								</Stack>
								<ListActionCreatePage
									isLoading={isCreatingOrganization}
									disableCreate={!canCreate}
								/>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Paper>
	);
}
