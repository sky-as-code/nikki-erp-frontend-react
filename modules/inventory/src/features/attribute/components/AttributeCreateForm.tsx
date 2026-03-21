import { Paper, Stack } from '@mantine/core';
import {
	AutoField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import React from 'react';
import { useNavigate } from 'react-router';

import { DetailActionBar } from '../../../components/ActionBar/DetailActionBar';

import type { FieldConstraint, FieldDefinition, ModelSchema } from '@nikkierp/ui/model';


type AttributeSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface AttributeCreateFormProps {
	schema: ModelSchema | AttributeSchema;
	isLoading: boolean;
	onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
	formId?: string;
}

export function AttributeCreateForm({
	schema,
	isLoading,
	onSubmit,
	formId,
}: AttributeCreateFormProps): React.ReactElement {

	return (
		<Paper className='p-4'>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='create'
					modelSchema={schema}
				>
					{({ handleSubmit }) => (
						<form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
							<Stack gap='md'>
								<Stack gap='md'>
									<AutoField name='displayName' autoFocused inputProps={{ disabled: isLoading }} />
									<AutoField name='codeName' inputProps={{ disabled: isLoading }} />
									<AutoField name='dataType' inputProps={{ disabled: isLoading }} />
									<AutoField name='isEnum' inputProps={{ disabled: isLoading }} />
									<AutoField name='isRequired' inputProps={{ disabled: isLoading }} />
									<AutoField name='sortIndex' inputProps={{ disabled: isLoading }} />
								</Stack>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Paper>
	);
}