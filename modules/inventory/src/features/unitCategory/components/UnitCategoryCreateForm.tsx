import {
	Group,
	Paper,
	Stack,
} from '@mantine/core';
import {
	AutoField,
	FormActions,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';


interface UnitCategoryCreateFormProps {
	schema: ModelSchema;
	isSubmitting: boolean;
	onSubmit: (data: Record<string, unknown>) => void;
	onCancel: () => void;
}

export function UnitCategoryCreateForm({
	schema,
	isSubmitting,
	onSubmit,
	onCancel,
}: UnitCategoryCreateFormProps): React.ReactElement {
	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={schema}
				modelLoading={isSubmitting}
			>
				{({ handleSubmit }) => (
					<Paper p='md' withBorder>
						<form onSubmit={handleSubmit(onSubmit)} noValidate>
							<Stack gap='md'>
								<AutoField
									name='name'
									autoFocused
									inputProps={{ disabled: isSubmitting }}
								/>
								<Group justify='flex-end' mt='md'>
									<FormActions
										isSubmitting={isSubmitting}
										onCancel={onCancel}
										isCreate
									/>
								</Group>
							</Stack>
						</form>
					</Paper>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}
