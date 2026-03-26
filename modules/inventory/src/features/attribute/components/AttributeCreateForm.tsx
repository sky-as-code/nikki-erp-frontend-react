import { Paper, Stack } from '@mantine/core';
import {
	AutoField,
	FormContainer,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import React from 'react';

import attributeSchema from '../../../schemas/attribute-schema.json';

import type { CreateAttributeRequest } from '../types';
import type { ModelSchema } from '@nikkierp/ui/model';


export type AttributeCreateSubmitPayload = Omit<CreateAttributeRequest, 'orgId' | 'productId'>;

interface AttributeCreateFormProps {
	isLoading: boolean;
	onSubmit: (data: AttributeCreateSubmitPayload) => void | Promise<void>;
	formId?: string;
}

const ATTRIBUTE_CREATE_SCHEMA = attributeSchema as ModelSchema;

type AttributeCreateFormContentProps = {
	isLoading: boolean;
	onSubmit: (data: any) => void | Promise<void>;
	handleSubmit: (
		onValid: (data: any) => void | Promise<void>,
	) => (e?: React.BaseSyntheticEvent) => Promise<void>;
};

function AttributeCreateFormContent({
	isLoading,
	onSubmit,
	handleSubmit,
}: AttributeCreateFormContentProps): React.ReactElement {
	return (
		<Paper>
			<form id='attribute-create-form' onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
				<Stack gap='lg'>
					<FormContainer>
						<Stack gap='sm'>
							<AutoField name='displayName' autoFocused inputProps={{ disabled: isLoading }} />
							<AutoField name='codeName' inputProps={{ disabled: isLoading }} />
							<AutoField name='dataType' inputProps={{ disabled: isLoading }} />
							<AutoField name='isRequired' inputProps={{ disabled: isLoading }} />
							<AutoField name='isEnum' inputProps={{ disabled: isLoading }} />
							<AutoField name='enumValue' inputProps={{ disabled: isLoading }} />
							<AutoField name='enumValueSort' inputProps={{ disabled: isLoading }} />
							<AutoField name='sortIndex' inputProps={{ disabled: isLoading }} />
							<AutoField name='groupId' inputProps={{ disabled: isLoading }} />
						</Stack>
					</FormContainer>
				</Stack>
			</form>
		</Paper>
	);
}

export function AttributeCreateForm({
	isLoading,
	onSubmit,
	formId,
}: AttributeCreateFormProps): React.ReactElement {
	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={ATTRIBUTE_CREATE_SCHEMA}
				modelLoading={isLoading}
			>
				{({ handleSubmit: formHandleSubmit }) => (
					<AttributeCreateFormContent
						isLoading={isLoading}
						onSubmit={onSubmit}
						handleSubmit={formHandleSubmit}
					/>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}