import { Paper, Stack } from '@mantine/core';
import {
	AutoField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import type { ProductCategoryCreateFormValues } from '../../hooks/useProductCategoryCreate';

interface ProductCategoryCreateFormProps {
	schema: ModelSchema;
	isLoading: boolean;
	onSubmit: (values: ProductCategoryCreateFormValues) => void;
}

export function ProductCategoryCreateForm({
	schema,
	isLoading,
	onSubmit,
}: ProductCategoryCreateFormProps): React.ReactElement {
	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={schema}
				modelLoading={isLoading}
			>
				{({ handleSubmit }) => (
					<Paper p='md' withBorder>
						<form id='product-category-create-form' onSubmit={handleSubmit(onSubmit)} noValidate>
							<Stack gap='md'>
								<AutoField name='name' autoFocused inputProps={{ disabled: isLoading }} />
							</Stack>
						</form>
					</Paper>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}
