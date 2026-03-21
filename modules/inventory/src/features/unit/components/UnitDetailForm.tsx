import {
	Paper,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import {
	AutoField,
	EntitySelectField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { JsonToString } from '../../../utils/serializer';

import type { Unit } from '../types';
import type { UnitDetailFormValues } from '../hooks/useUnitDetail';
import type { UnitCategory } from '../../unitCategory/types';
import { DetailActionBar } from '../../../components/ActionBar/DetailActionBar';
import { useTranslation } from 'react-i18next';


interface UnitDetailFormProps {
	schema: ModelSchema;
	unit: Unit | undefined;
	units: Unit[];
	unitCategories: UnitCategory[];
	isLoading: boolean;
	isSubmitting: boolean;
	onSave: (values: UnitDetailFormValues) => void | Promise<void>;
}

export function UnitDetailForm({
	schema,
	unitCategories,
	units,
	unit,
	isSubmitting,
	onSave,
}: UnitDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	const modelValue = {
		...unit,
		name: JsonToString(unit?.name),
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='update'
				modelSchema={schema}
				modelLoading={isSubmitting}
				modelValue={modelValue}
			>
				{({ handleSubmit }) => (
					<form onSubmit={handleSubmit(onSave)} noValidate>
						<Stack gap='md'>
							<AutoField name='name' inputProps={{ disabled: isSubmitting }} />
							<AutoField name='symbol' inputProps={{ disabled: isSubmitting }} />
							<EntitySelectField
								fieldName='baseUnit'
								entities={units}
								getEntityId={(u) => u.id}
								getEntityName={(u) => JsonToString(u.name)}
								placeholder='Select base unit'
								shouldDisable={isSubmitting}
								selectProps={{ clearable: true }}
							/>
							<AutoField name='multiplier' inputProps={{ disabled: isSubmitting }} />
							<AutoField name='status' inputProps={{ disabled: isSubmitting }} />
							<EntitySelectField
								fieldName='categoryId'
								entities={unitCategories}
								getEntityId={(category) => category.id}
								getEntityName={(category) => JsonToString(category.name)}
								shouldDisable={isSubmitting}
								selectProps={{ clearable: true }}
							/>
							<div>
								<Text size='sm' fw={500} mb='xs'>
									{t('nikki.identity.user.fields.createdAt')}
								</Text>
								<TextInput
									value={
										unit?.createdAt
											? new Date(unit.createdAt).toLocaleString()
											: ''
									}
									size='md'
									variant='filled'
									readOnly
								/>
							</div>
							<div>
								<Text size='sm' fw={500} mb='xs'>
									{t('nikki.identity.user.fields.updatedAt')}
								</Text>
								<TextInput
									value={
										unit?.updatedAt
											? new Date(unit.updatedAt).toLocaleString()
											: ''
									}
									size='md'
									variant='filled'
									readOnly
								/>
							</div>
						</Stack>
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}
