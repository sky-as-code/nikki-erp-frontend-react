import { Input, InputProps, Text } from '@mantine/core';
import { DateTimePicker, DateTimePickerProps, TimeInput } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import React from 'react';
import { Controller } from 'react-hook-form';

import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';

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

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			description={t(fieldData.description)}
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

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			description={t(fieldData.description)}
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
 */
export function ReadOnlyTextField(props: { name: string, localize: LocalizeFn }) {
	const { name, localize: t } = props;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { modelValue } = useFormField();

	if (!fieldData) {
		return null;
	}

	const value = modelValue?.[name];
	const display = value === null || value === undefined || value === ''
		? '—'
		: t(value as any) || String(value);

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			description={t(fieldData.description)}
			isRequired={false}
			error={undefined}
		>
			<Input.Wrapper id={inputId}>
				<Text size='md'>{display}</Text>
			</Input.Wrapper>
		</BaseFieldWrapper>
	);
}
