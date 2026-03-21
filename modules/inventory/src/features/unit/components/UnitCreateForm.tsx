import {
	Group,
	Paper,
	Stack,
} from '@mantine/core';
import {
	AutoField,
	EntitySelectField,
	FormActions,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import type { UnitCategory } from '../../unitCategory/types';
import { JsonToString } from '../../../utils/serializer';


interface UnitCreateFormProps {
	schema: ModelSchema;
	unitCategories: UnitCategory[];
	isSubmitting: boolean;
	onSubmit: (data: Record<string, unknown>) => void;
}

export function UnitCreateForm({
	schema,
	unitCategories,
	isSubmitting,
	onSubmit,
}: UnitCreateFormProps): React.ReactElement {
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
								<AutoField
									name='symbol'
									inputProps={{ disabled: isSubmitting }}
								/>
								<EntitySelectField
									fieldName='categoryId'
									entities={unitCategories}
									getEntityId={(category) => category.id}
									getEntityName={(category) => JsonToString(category.name)}
									placeholder='Select unit category'
									shouldDisable={isSubmitting}
									selectProps={{ clearable: false }}
								/>
							</Stack>
						</form>
					</Paper>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}
