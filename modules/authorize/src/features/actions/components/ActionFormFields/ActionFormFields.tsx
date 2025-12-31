import { Select } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { AutoField, useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Resource } from '@/features/resources';


interface ActionFormFieldsProps {
	isCreate: boolean;
	resources?: Resource[];
}

export const ActionFormFields: React.FC<ActionFormFieldsProps> = ({
	isCreate,
	resources,
}) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('resourceId');
	const inputId = useId();

	const resourceOptions = React.useMemo(() => {
		if (!resources) return [];
		return resources.map((r) => ({
			value: r.id,
			label: r.name,
		}));
	}, [resources]);

	if (!fieldData) {
		return null;
	}

	return (
		<>
			{!isCreate && <AutoField name='id' />}
			<AutoField
				name='name'
				autoFocused
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
			/>
			<AutoField name='description' />
			{isCreate ? (
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
								data={resourceOptions}
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
			) : (
				<AutoField
					name='resourceId'
					htmlProps={{ readOnly: true }}
				/>
			)}
		</>
	);
};
