import {
	Stack,
	Text,
	TextInput,
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
import { useTranslation } from 'react-i18next';

const UPDATE_FORM_FIELDS = ['name', 'symbol', 'categoryId', 'baseUnit', 'multiplier', 'status'];


interface UnitDetailFormProps {
	schema: ModelSchema;
	unit: Unit | undefined;
	units: Unit[];
	unitCategories: UnitCategory[];
	isLoading: boolean;
	isSubmitting: boolean;
	isEditing: boolean;
	onSave: (values: UnitDetailFormValues) => void | Promise<void>;
}

export function UnitDetailForm({
	schema,
	unitCategories,
	units,
	unit,
	isSubmitting,
	isEditing,
	onSave,
}: UnitDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	const modelValue = {
		...unit,
		name: JsonToString(unit?.name),
	};

	const isReadOnly = !isEditing || isSubmitting;

	const updateSchema = React.useMemo((): ModelSchema => ({
		...schema,
		fields: Object.fromEntries(
			Object.entries(schema.fields).map(([key, field]) => [
				key,
				UPDATE_FORM_FIELDS.includes(key) ? field : { ...field, frontendOnly: true },
			]),
		),
	}), [schema]);

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='update'
				modelSchema={updateSchema}
				modelLoading={isSubmitting}
				modelValue={modelValue}
			>
				{({ handleSubmit }) => (
					<form id='unit-detail-form' onSubmit={handleSubmit(onSave)} noValidate>
						<Stack gap='md'>
							<AutoField name='name' htmlProps={{ readOnly: isReadOnly }} />
							<AutoField name='symbol' htmlProps={{ readOnly: isReadOnly }} />
							<EntitySelectField
								fieldName='baseUnit'
								entities={units}
								getEntityId={(u) => u.id}
								getEntityName={(u) => JsonToString(u.name)}
								placeholder='Select base unit'
								shouldDisable={isReadOnly}
								selectProps={{ clearable: true }}
							/>
							<AutoField name='multiplier' htmlProps={{ readOnly: isReadOnly }} />
							<AutoField name='status' htmlProps={{ readOnly: isReadOnly }} />
							<EntitySelectField
								fieldName='categoryId'
								entities={unitCategories}
								getEntityId={(category) => category.id}
								getEntityName={(category) => JsonToString(category.name)}
								shouldDisable={isReadOnly}
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
