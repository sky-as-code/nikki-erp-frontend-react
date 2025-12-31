import { Select } from '@mantine/core';
import { useId } from '@mantine/hooks';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BaseFieldWrapper } from './fields';
import { useFormField, useFieldData } from './formContext';


export interface SelectOption {
	value: string;
	label: string;
}

export interface EntitySelectFieldProps<TEntity> {
	fieldName: string;
	entities?: TEntity[];
	getEntityId: (entity: TEntity) => string;
	getEntityName: (entity: TEntity) => string;

	// Options customization
	optionsTransformer?: (entities: TEntity[], baseOptions: SelectOption[]) => SelectOption[];
	prependOptions?: SelectOption[];
	appendOptions?: SelectOption[];

	// Behavior customization
	shouldDisable?: boolean;
	placeholder?: string;

	// Select props
	selectProps?: Partial<React.ComponentPropsWithoutRef<typeof Select>>;
}

function buildSelectOptions<TEntity>(
	entities: TEntity[],
	getEntityId: (entity: TEntity) => string,
	getEntityName: (entity: TEntity) => string,
	prependOptions?: SelectOption[],
	appendOptions?: SelectOption[],
	optionsTransformer?: (entities: TEntity[], baseOptions: SelectOption[]) => SelectOption[],
): SelectOption[] {
	const baseOptions = entities.map((entity) => ({
		value: getEntityId(entity),
		label: getEntityName(entity),
	}));

	let finalOptions = [...baseOptions];

	if (prependOptions) {
		finalOptions = [...prependOptions, ...finalOptions];
	}

	if (appendOptions) {
		finalOptions = [...finalOptions, ...appendOptions];
	}

	if (optionsTransformer) {
		finalOptions = optionsTransformer(entities, finalOptions);
	}

	return finalOptions;
}

function resolvePlaceholder(
	placeholder: string | undefined,
	fieldData: ReturnType<typeof useFieldData> | null,
	translate: (key: string) => string,
): string {
	if (placeholder !== undefined) {
		return placeholder;
	}
	return fieldData?.placeholder ? translate(fieldData.placeholder) : '';
}

export function EntitySelectField<TEntity>({
	fieldName,
	entities = [],
	getEntityId,
	getEntityName,
	optionsTransformer,
	prependOptions,
	appendOptions,
	shouldDisable,
	placeholder,
	selectProps,
}: EntitySelectFieldProps<TEntity>) {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData(fieldName);
	const inputId = useId();

	const options = React.useMemo(
		() => buildSelectOptions(
			entities,
			getEntityId,
			getEntityName,
			prependOptions,
			appendOptions,
			optionsTransformer,
		),
		[entities, getEntityId, getEntityName, prependOptions, appendOptions, optionsTransformer],
	);

	const resolvedPlaceholder = React.useMemo(
		() => resolvePlaceholder(placeholder, fieldData, translate),
		[placeholder, fieldData, translate],
	);

	if (!fieldData) {
		return null;
	}

	const isDisabled = shouldDisable ?? false;

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			description={translate(fieldData.description ?? '')}
			isRequired={fieldData.isRequired}
			error={translate(fieldData.error ?? '')}
		>
			<Controller
				name={fieldName}
				control={control}
				rules={{ required: fieldData.isRequired }}
				render={({ field }) => (
					<Select
						id={inputId}
						placeholder={resolvedPlaceholder}
						data={options}
						value={isDisabled ? null : (field.value || null)}
						onChange={(val) => {
							field.onChange(val === null ? undefined : val);
						}}
						searchable
						clearable
						required={fieldData.isRequired}
						disabled={isDisabled}
						{...selectProps}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}
