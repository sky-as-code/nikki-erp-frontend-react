import { useId } from '@mantine/hooks';
import React from 'react';
import { Controller } from 'react-hook-form';

import { fieldErrorText } from './fieldErrors';
import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { useFieldTestAttrs } from './formTestIds';
import { useFormInputSize } from '../Input/inlineControls';
import { formInputProps } from '../Input/inputDensity';
import { MaskInput } from '../MaskInput';

import type { LocalizeFn } from '../../i18n';
import type { MaskInputProps } from '../MaskInput';


/** Room for a code whose schema states no maximum length. */
const UNBOUNDED_CODE_LENGTH = 255;

const RESOURCE_CODE_TOKENS = { C: /[A-Z0-9-]/ };

/**
 * One optional `C` slot per allowed character: the mask then stops at the schema's maximum, and
 * never blocks a short code as incomplete (`?` makes every slot after it optional).
 */
export function resourceCodeMask(maxLength?: number): string {
	return '?' + 'C'.repeat(maxLength && maxLength > 0 ? maxLength : UNBOUNDED_CODE_LENGTH);
}

export function toResourceCodeChar(char: string): string {
	return char.toUpperCase();
}

/** The mask props that let a `MaskInput` take only `A-Z`, `0-9` and `-`, uppercasing typed letters. */
export function resourceCodeMaskProps(maxLength?: number): Pick<
	MaskInputProps, 'mask' | 'tokens' | 'transform' | 'slotChar'
> {
	return {
		mask: resourceCodeMask(maxLength),
		tokens: RESOURCE_CODE_TOKENS,
		transform: toResourceCodeChar,
		slotChar: null,
	};
}

function maxLengthOf(options: Record<string, unknown> | undefined): number | undefined {
	const length = options?.length;
	return Array.isArray(length) && typeof length[1] === 'number' ? length[1] : undefined;
}

export type ResourceCodeFieldProps = {
	name: string,
	localize: LocalizeFn,
	inputProps?: Partial<MaskInputProps>,
	ref?: React.RefObject<HTMLInputElement | null>,
};

/** A `nikkiResourceCode` input: a strict mask, so a code the server would refuse cannot be typed. */
export function ResourceCodeField({ name, localize: t, inputProps, ref }: ResourceCodeFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading } = useFormField();
	const fieldAttrs = useFieldTestAttrs(name);
	const size = useFormInputSize();

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const maskProps = resourceCodeMaskProps(maxLengthOf(fieldData.fieldDef.data_type.options));
	return (
		<BaseFieldWrapper
			inputId={inputId} label={t(fieldData.label)} isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
		>
			<Controller
				name={name} control={control} defaultValue={defaultValue}
				render={({ field }) => (
					<MaskInput
						id={inputId} {...maskProps}
						value={(field.value !== undefined ? field.value : defaultValue) ?? ''}
						onChangeRaw={raw => field.onChange(raw)}
						onBlur={field.onBlur} name={field.name}
						ref={(element: HTMLInputElement | null) => {
							field.ref(element);
							if (ref) {
								ref.current = element;
							}
						}}
						error={fieldData.error} disabled={modelLoading}
						placeholder={fieldData.placeholder ? t(fieldData.placeholder) : undefined}
						{...fieldAttrs} {...formInputProps(inputProps, size)}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}
