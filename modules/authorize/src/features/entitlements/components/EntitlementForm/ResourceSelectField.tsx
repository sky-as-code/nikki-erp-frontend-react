import { Select } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ALL_RESOURCES_VALUE } from '@/features/entitlements/validation/entitlementFormValidation';

import type { Resource } from '@/features/resources';


export const ResourceSelectField: React.FC<{ resources?: Resource[] }> = ({ resources }) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('resourceId');
	const inputId = useId();

	const options = React.useMemo(
		() => ([
			{
				value: ALL_RESOURCES_VALUE,
				label: translate('nikki.authorize.entitlement.fields.resource_all'),
			},
			...(resources ?? []).map((r) => ({ value: r.id, label: r.name })),
		]),
		[resources, translate],
	);

	if (!fieldData) {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			description={translate(fieldData.description ?? '')}
			isRequired={fieldData.isRequired}
			error={translate(fieldData.error ?? '')}
		>
			<Controller
				name='resourceId'
				control={control}
				rules={{ required: fieldData.isRequired }}
				render={({ field }) => (
					<Select
						id={inputId}
						placeholder={translate(fieldData.placeholder || '')}
						data={options}
						value={field.value || null}
						onChange={(val) => {
							field.onChange(val === null ? undefined : val);
						}}
						searchable
						clearable
						required={fieldData.isRequired}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
};