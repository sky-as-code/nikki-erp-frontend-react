import { InputProps } from '@mantine/core';
import { useId } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { Controller } from 'react-hook-form';

import { fieldErrorText } from './fieldErrors';
import { useFieldLabelHidden } from './fieldLabelContext';
import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { useFieldPartTestAttrs, useFieldTestAttrs } from './formTestIds';
import { LocalizeFn, useI18n } from '../../i18n';
import { useFormInputSize } from '../Input/inlineControls';
import { TranslatableInput } from '../translatable/TranslatableInput';


export type LangJsonFieldProps = {
	name: string,
	inputProps?: Partial<InputProps>,
	localize: LocalizeFn,
};

export function LangJsonField({ name, inputProps, localize }: LangJsonFieldProps): React.ReactNode {
	const t = localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading } = useFormField();
	const i18n = useI18n();
	const fieldAttrs = useFieldTestAttrs(name);
	const translateAttrs = useFieldPartTestAttrs(name, 'translate');
	const labelHidden = useFieldLabelHidden();
	const size = useFormInputSize();

	if (!fieldData) {
		return null;
	}

	const defaultValue = (modelValue?.[name] ?? {}) as dyn.ModelSchemaLangJson;
	const fieldLabel = t(fieldData.label);
	const error = fieldErrorText(t, fieldData);
	// With no visible label the language the input edits goes into the hidden one, so a screen
	// reader announces it; an `aria-label` would lose to the wrapper's `aria-labelledby`.
	const label = labelHidden ? `${fieldLabel} (${i18n.language})` : fieldLabel;

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			render={({ field }) => (
				<BaseFieldWrapper inputId={inputId} label={label} isRequired={fieldData.isRequired} error={error}>
					<TranslatableInput
						id={inputId}
						value={(field.value ?? defaultValue) as dyn.ModelSchemaLangJson}
						onChange={field.onChange}
						onBlur={field.onBlur}
						label={fieldLabel}
						required={fieldData.isRequired}
						error={Boolean(error)}
						disabled={modelLoading || Boolean(inputProps?.disabled)}
						placeholder={t(fieldData.placeholder)}
						size={size}
						testAttrs={fieldAttrs}
						translateTestAttrs={translateAttrs}
						inputProps={inputProps}
					/>
				</BaseFieldWrapper>
			)}
		/>
	);
}
