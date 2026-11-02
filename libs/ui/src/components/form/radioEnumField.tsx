import { Radio } from '@mantine/core';
import { useId } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { Controller } from 'react-hook-form';

import { fieldErrorText } from './fieldErrors';
import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { useFieldTestAttrs } from './formTestIds';

import type { LocalizeFn } from '../../i18n';


export type RadioEnumFieldProps = {
	name: string,
	disabled?: boolean,
};

type RadioOption = { value: string, label: string };

/** The enum's values with their labels, translated the way `StaticEnumSelectField` translates them. */
export function enumRadioOptions(fieldDef: dyn.ModelSchemaField, localize: LocalizeFn): RadioOption[] {
	const enumValues = (fieldDef.data_type.options?.enumValues ?? []) as string[];
	return enumValues.map(value => ({
		value,
		label: localize(dyn.newLangJsonRef(`${fieldDef.name}.${value}`)),
	}));
}

/**
 * An enum field as one radio per value: side by side from the `sm` breakpoint, stacked below it.
 * The data-type default stays the select; a page opts into this through the `radio` field renderer.
 */
export function RadioEnumField({ name, disabled }: RadioEnumFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, localize: t } = useFormField();
	const testAttrs = useFieldTestAttrs(name);
	if (!fieldData) {
		return null;
	}
	const defaultValue = modelValue?.[name];
	const options = enumRadioOptions(fieldData.fieldDef, t);
	return (
		<BaseFieldWrapper
			inputId={inputId} label={t(fieldData.label)} isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
		>
			<Controller
				name={name} control={control} defaultValue={defaultValue}
				render={({ field }) => (
					<RadioOptions
						id={inputId} name={field.name} options={options}
						value={(field.value !== undefined ? field.value : defaultValue) as string | null | undefined}
						onChange={field.onChange} onBlur={field.onBlur}
						disabled={modelLoading || disabled} testId={testAttrs['data-testid']}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}

type RadioOptionsProps = {
	id: string,
	name: string,
	options: RadioOption[],
	value: string | null | undefined,
	onChange: (value: string) => void,
	onBlur: () => void,
	disabled?: boolean,
	testId?: string,
} & React.AriaAttributes;

/** The radios themselves; `BaseFieldWrapper` hands the group its label and error ARIA attributes. */
function RadioOptions({
	id, name, options, value, onChange, onBlur, disabled, testId, ...aria
}: RadioOptionsProps) {
	return (
		<div id={id} role='radiogroup' className='flex flex-col gap-2 py-1 sm:flex-row sm:flex-wrap sm:gap-6' {...aria}
			data-testid={testId}
		>
			{options.map(option => (
				<Radio
					key={option.value} name={name} value={option.value} label={option.label}
					checked={value === option.value} disabled={disabled}
					onChange={() => onChange(option.value)} onBlur={onBlur}
					data-testid={testId ? `${testId}.${option.value}` : undefined}
				/>
			))}
		</div>
	);
}
