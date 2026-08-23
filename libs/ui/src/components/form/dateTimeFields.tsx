import { Input, InputProps, Text } from '@mantine/core';
import { DateTimePicker, DateTimePickerProps, TimeInput } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { useFieldTestAttrs } from './formTestIds';

import type { LocalizeFn } from '../../i18n';


export type DateTimeFieldProps<TInputProp> = {
	name: string,
	autoFocused?: boolean,
	inputProps?: Partial<TInputProp>,
	htmlProps?: Record<string, unknown>,
	ref?: React.RefObject<any>,
	localize: LocalizeFn,
};

/** Coerces a stored value — an ISO string, or already a Date — to what Mantine's pickers want. */
function toDate(value: unknown): Date | null {
	if (value instanceof Date) {
		return value;
	}
	if (typeof value === 'string' && value) {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}
	return null;
}

export function DateTimeInputField(props: DateTimeFieldProps<DateTimePickerProps>) {
	const { name, localize: t } = props;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading } = useFormField();
	const fieldAttrs = useFieldTestAttrs(name);

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			// Uncomment to show sub-labels
			// description={t(fieldData.description)}
			isRequired={fieldData.isRequired}
			error={t(fieldData.error as any)}
		>
			<Controller
				name={name}
				control={control}
				defaultValue={defaultValue}
				render={({ field }) => (
					<DateTimePicker
						id={inputId}
						value={toDate(field.value !== undefined ? field.value : defaultValue)}
						onChange={value => field.onChange(value || undefined)}
						disabled={modelLoading}
						placeholder={t(fieldData.placeholder)}
						size='md'
						{...fieldAttrs}
						{...props.inputProps}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}

export function TimeInputField(props: DateTimeFieldProps<InputProps>) {
	const { name, localize: t } = props;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading } = useFormField();
	const fieldAttrs = useFieldTestAttrs(name);

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			isRequired={fieldData.isRequired}
			error={t(fieldData.error as any)}
		>
			<Controller
				name={name}
				control={control}
				defaultValue={defaultValue}
				render={({ field }) => (
					<TimeInput
						id={inputId}
						value={(field.value as string) ?? ''}
						onChange={event => field.onChange(event.currentTarget.value || undefined)}
						disabled={modelLoading}
						size='md'
						{...fieldAttrs}
						{...(props.inputProps as any)}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}

/**
 * A field the form shows but will not let the user change, because the server rejects updates to
 * it. Rendering the value as text rather than a disabled input keeps it readable and makes clear
 * it is not merely temporarily unavailable.
 *
 * Renders nothing when the record holds no value. A lone dash under a label reads as content the
 * record actually carries, and on a detail page in edit mode it produced a column of empty labelled
 * slots — worse than simply leaving those fields out.
 */
export function ReadOnlyTextField(props: { name: string, localize: LocalizeFn }) {
	const { name, localize: t } = props;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue } = useFormField();
	// The form's own value first: `modelValue` is only populated by `AdhocFormProvider`, so under
	// `CrudFormProvider` — every resource detail page — it is always undefined, and reading it
	// alone rendered a dash for fields the record does hold, `code` being the visible case.
	const watched = useWatch({ control, name }) as unknown;
	const value = watched ?? modelValue?.[name];

	if (!fieldData || value === null || value === undefined || value === '') {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			isRequired={false}
			error={undefined}
		>
			<Input.Wrapper id={inputId}>
				<Text size='md'>{displayReadOnlyValue(value, t)}</Text>
			</Input.Wrapper>
		</BaseFieldWrapper>
	);
}

/**
 * A read-only value as text.
 *
 * Only a LangJson object goes through `localize` — a plain string is already final. Passing one in
 * makes `localize` treat it as a translation key and hand back `{namespace}:{value}`, which is how
 * a kiosk code rendered as `vending_machine_new:KIOSK-NEW-SEED-002`.
 */
function displayReadOnlyValue(value: unknown, localize: LocalizeFn): string {
	if (value !== null && typeof value === 'object') {
		const localized = localize(value as any);
		return localized === MISSING_TRANSLATION ? '' : localized;
	}
	return String(value);
}

/** What `useLocalize` hands back for a LangJson carrying no entry for the active language. */
const MISSING_TRANSLATION = '$missing.translation';
