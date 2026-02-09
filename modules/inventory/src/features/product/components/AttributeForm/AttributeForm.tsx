import { Stack } from '@mantine/core';
import { AutoField, FormActions, FormModal } from '@nikkierp/ui/components';
import React from 'react';

import attributeSchema from '../../../../schemas/attribute-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


export type AttributeFormValues = {
	displayName: string;
	codeName: string;
	dataType: 'string' | 'number' | 'bool';
	isEnum: boolean;
	isRequired: boolean;
	sortIndex: number;
};

interface AttributeFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: AttributeFormValues) => Promise<void>;
}

const ATTRIBUTE_BASE_SCHEMA = attributeSchema as ModelSchema;

const DEFAULT_ATTRIBUTE_FORM_VALUES: AttributeFormValues = {
	displayName: '',
	codeName: '',
	dataType: 'string',
	isEnum: true,
	isRequired: true,
	sortIndex: 0,
};

export const AttributeForm: React.FC<AttributeFormProps> = ({
	opened,
	onClose,
	onSubmit,
}) => {
	return (
		<FormModal
			key={opened ? 'attribute-form-open' : 'attribute-form-closed'}
			opened={opened}
			onClose={onClose}
			title='Create New Attribute'
			formVariant='create'
			modelSchema={ATTRIBUTE_BASE_SCHEMA}
			modelValue={DEFAULT_ATTRIBUTE_FORM_VALUES}
		>
			{({ handleSubmit, form }) => (
				<form onSubmit={handleSubmit(async (data) => {
					await onSubmit(data as AttributeFormValues);
					onClose();
				})}>
					<Stack gap='md'>
						<AutoField name='displayName' autoFocused />
						<AutoField name='codeName' />
						<AutoField name='dataType' />
						<AutoField name='isEnum' />
						<AutoField name='isRequired' />
						<AutoField name='sortIndex' />
						<FormActions
							isSubmitting={form.formState.isSubmitting}
							onCancel={onClose}
							isCreate
						/>
					</Stack>
				</form>
			)}
		</FormModal>
	);
};
