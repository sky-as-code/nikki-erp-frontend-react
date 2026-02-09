import { Stack } from '@mantine/core';
import { AutoField, FormActions, FormModal } from '@nikkierp/ui/components';
import React from 'react';

import variantSchema from '../../../../schemas/variant-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


export type VariantFormValues = {
	name: string;
	sku: string;
	barcode: string;
	proposedPrice: number;
	status: 'active' | 'inactive';
};

interface VariantFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: VariantFormValues) => Promise<void>;
}

const VARIANT_BASE_SCHEMA = variantSchema as ModelSchema;

const DEFAULT_VARIANT_FORM_VALUES: VariantFormValues = {
	name: '',
	sku: '',
	barcode: '',
	proposedPrice: 0,
	status: 'active',
};

export const VariantForm: React.FC<VariantFormProps> = ({
	opened,
	onClose,
	onSubmit,
}) => {
	return (
		<FormModal
			key={opened ? 'variant-form-open' : 'variant-form-closed'}
			opened={opened}
			onClose={onClose}
			title='Create New Variant'
			formVariant='create'
			modelSchema={VARIANT_BASE_SCHEMA}
			modelValue={DEFAULT_VARIANT_FORM_VALUES}
		>
			{({ handleSubmit, form }) => (
				<form onSubmit={handleSubmit(async (data) => {
					await onSubmit(data as VariantFormValues);
					onClose();
				})}>
					<Stack gap='md'>
						<AutoField name='name' autoFocused />
						<AutoField name='sku' />
						<AutoField name='barcode' />
						<AutoField name='proposedPrice' />
						<AutoField name='status' />
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
