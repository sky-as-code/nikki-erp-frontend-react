import { Paper, Stack } from '@mantine/core';
import {
	FormFieldProvider,
	FormStyleProvider,
	AutoField,
} from '@nikkierp/ui/components';
import React from 'react';
import { useNavigate } from 'react-router';

import { DetailActionBar } from '../../../../components/ActionBar/DetailActionBar';

import type { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';


type VariantSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface VariantCreateFormProps {
	schema: VariantSchema;
	isLoading: boolean;
	onSubmit: (data: Record<string, unknown>) => void;
}

export function VariantCreateForm({ schema, isLoading, onSubmit }: VariantCreateFormProps): React.ReactElement {
	const navigate = useNavigate();

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<Paper className='p-4'>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='create'
					modelSchema={schema}
				>
					{({ handleSubmit }) => (
						<form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
							<Stack gap='md'>
								<Stack gap='md'>
									<AutoField name='name' autoFocused inputProps={{ disabled: isLoading }} />
									<AutoField name='sku' inputProps={{ disabled: isLoading }} />
									<AutoField name='barcode' inputProps={{ disabled: isLoading }} />
									<AutoField name='proposedPrice' inputProps={{ disabled: isLoading }} />
									<AutoField name='status' inputProps={{ disabled: isLoading }} />
								</Stack>

								<DetailActionBar
									onSave={() => void handleSubmit(onSubmit)()}
									onGoBack={handleGoBack}
									onDelete={handleGoBack}
								/>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Paper>
	);
}
