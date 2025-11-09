import { ActionIcon, Grid, Input, NumberInput, Select, Text, InputProps, NumberInputProps } from '@mantine/core';
import { DateInput, DateInputProps } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import React from 'react';
import { Controller } from 'react-hook-form';

import { extractLabel, useFieldData, useFormField, useFormStyle } from './formContext';


export type AutoFieldProps = {
	name: string;
	autoFocused?: boolean;
	inputProps?: Partial<InputProps>;
	htmlProps?: FilteredInputHTMLAttributes;
	ref?: React.RefObject<any>;
};

export function AutoField(props: AutoFieldProps) {
	const { getFieldDef } = useFormField();
	const fieldDef = getFieldDef(props.name);
	const ref = React.useRef<HTMLInputElement | null>(null);

	if (!fieldDef) {
		return null;
	}

	if (fieldDef.hidden) {
		return null;
	}

	switch (fieldDef.type) {
		case 'string':
			return <TextInputField
				name={props.name} type='text' autoFocused={props.autoFocused}
				inputProps={props.inputProps} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
			/>;
		case 'email':
			return <TextInputField
				name={props.name} type='email' autoFocused={props.autoFocused}
				inputProps={props.inputProps} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
			/>;
		case 'password':
			return <PasswordInputField
				name={props.name} autoFocused={props.autoFocused}
				inputProps={props.inputProps} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
			/>;
		case 'integer':
			return <NumberInputField
				name={props.name} autoFocused={props.autoFocused}
				inputProps={props.inputProps as Partial<NumberInputProps>} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
			/>;
		case 'date':
			return <DateInputField
				name={props.name} autoFocused={props.autoFocused}
				inputProps={props.inputProps as Partial<DateInputProps>} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
			/>;
		case 'enum':
			if (fieldDef.enum) {
				return <StaticEnumSelectField
					name={props.name} autoFocused={props.autoFocused}
					inputProps={props.inputProps as Partial<SelectProps>} htmlProps={props.htmlProps}
					ref={props.ref ?? ref}
				/>;
			}
			if (fieldDef.enumSrc) {
				return <DynamicEnumSelectField
					name={props.name} autoFocused={props.autoFocused}
					inputProps={props.inputProps as Partial<SelectProps>} htmlProps={props.htmlProps}
					ref={props.ref ?? ref}
				/>;
			}
			return null;
		default:
			return null;
	}
}

type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;

function useDefaultInputProps(inputProps?: Partial<InputProps>): Partial<InputProps> {
	return React.useMemo(() => ({
		size: 'md' as const,
		...inputProps,
	}), [inputProps]);
}

function useAutoFocus(
	autoFocused: boolean | undefined,
	inputRef: React.RefObject<HTMLInputElement | null>,
	formVariant: 'create' | 'update',
) {
	React.useEffect(() => {
		if (autoFocused && formVariant === 'create' && inputRef.current) {
			inputRef.current.focus();
		}
	}, [autoFocused, formVariant, inputRef]);
}

function useAutoFocusById(
	autoFocused: boolean | undefined,
	inputId: string,
	formVariant: 'create' | 'update',
) {
	React.useEffect(() => {
		if (autoFocused) {
			const input = document.getElementById(inputId) as HTMLInputElement;
			if (input) {
				setTimeout(() => {
					input.focus();
				}, 0);
			}
		}
	}, [autoFocused, formVariant, inputId]);
}

function usePasswordToggle(
	showPassword: boolean,
	setShowPassword: React.Dispatch<React.SetStateAction<boolean>>,
): React.ReactNode {
	const handleMouseDown = React.useCallback(() => {
		setShowPassword(true);
	}, [setShowPassword]);

	const handleMouseUp = React.useCallback(() => {
		setShowPassword(false);
	}, [setShowPassword]);

	const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
		if (e.key === ' ') {
			e.preventDefault();
			setShowPassword(true);
		}
	}, [setShowPassword]);

	const handleKeyUp = React.useCallback((e: React.KeyboardEvent) => {
		if (e.key === ' ') {
			e.preventDefault();
			setShowPassword(false);
		}
	}, [setShowPassword]);

	const actionIcon = React.useMemo(() => (
		<ActionIcon
			tabIndex={0}
			variant='subtle'
			aria-label={showPassword ? 'Hide password' : 'Show password'}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onKeyDown={handleKeyDown}
			onKeyUp={handleKeyUp}
		>
			{showPassword ? <IconEye size={20} /> : <IconEyeOff size={20} />}
		</ActionIcon>
	), [showPassword, handleMouseDown, handleMouseUp, handleKeyDown, handleKeyUp]);

	return actionIcon;
}


type BaseFieldWrapperProps = {
	inputId: string;
	label: string;
	description?: string;
	isRequired: boolean;
	error: string | undefined;
	children: React.ReactNode;
	ariaProps?: {
		'aria-labelledby': string;
		'aria-describedby'?: string;
		'aria-required'?: boolean;
		'aria-invalid'?: boolean;
	};
};

function BaseFieldWrapper({
	inputId, label, description, isRequired, error, children, ariaProps,
}: BaseFieldWrapperProps) {
	const { layout } = useFormStyle();
	const twoColumnLayout = layout === 'twocol';
	const descriptionId = useId();
	const errorId = useId();

	// Build aria-describedby from description and error
	const ariaDescribedBy = React.useMemo(() => {
		const ids: string[] = [];
		if (description) ids.push(descriptionId);
		if (error) ids.push(errorId);
		return ids.length > 0 ? ids.join(' ') : undefined;
	}, [description, error, descriptionId, errorId]);

	const labelId = `${inputId}-label`;

	// Build aria attributes object
	const defaultAriaProps = React.useMemo(() => ({
		'aria-labelledby': labelId,
		'aria-describedby': ariaDescribedBy,
		'aria-required': isRequired || undefined,
		'aria-invalid': error ? true : undefined,
	}), [labelId, ariaDescribedBy, isRequired, error]);

	return (
		<Grid grow gutter={0} mt='md'>
			<Grid.Col span={twoColumnLayout ? 4 : 12}>
				<Input.Label htmlFor={inputId} id={labelId}>
					{label}
					{isRequired && <Text component='span' c='red' ml={4}>*</Text>}
				</Input.Label>
				{description && <Input.Description id={descriptionId}>{description}</Input.Description>}
			</Grid.Col>
			<Grid.Col span={twoColumnLayout ? 8 : 12}>
				{React.cloneElement(children as React.ReactElement, {
					...(ariaProps || defaultAriaProps),
				})}
				{error && <Input.Error id={errorId}>{error}</Input.Error>}
			</Grid.Col>
		</Grid>
	);
}

type FilteredInputHTMLAttributes = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'size' | 'type' | 'onChange' | 'onBlur' | 'value' | 'defaultValue' | 'name' | 'id' | 'ref' | 'disabled' | 'min' | 'max' | 'step'
>;

type BaseInputProps<TInputProp> = {
	name: string;
	autoFocused?: boolean;
	inputProps?: Partial<TInputProp>;
	htmlProps?: FilteredInputHTMLAttributes;
	ref: React.RefObject<HTMLInputElement | null>;
};

export type TextInputFieldProps = BaseInputProps<InputProps> & {
	type: 'text' | 'email';
};

export function TextInputField({ name, type, autoFocused, inputProps, htmlProps, ref }: TextInputFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { register, modelValue, modelLoading, formVariant } = useFormField();

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const defaultInputProps = useDefaultInputProps(inputProps);
	useAutoFocus(autoFocused, ref, formVariant);

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			description={fieldData.description}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Input
				id={inputId}
				type={type}
				{...(() => {
					const registerResult = register(name);
					return {
						...registerResult,
						ref: (e: HTMLInputElement | null) => {
							if (typeof registerResult.ref === 'function') {
								registerResult.ref(e);
							}
							ref.current = e;
						},
					};
				})()}
				defaultValue={defaultValue}
				error={fieldData.error}
				disabled={modelLoading}
				placeholder={fieldData.placeholder}
				withAria={false}
				{...htmlProps}
				{...defaultInputProps}
			/>
		</BaseFieldWrapper>
	);
}

export type PasswordInputFieldProps = BaseInputProps<InputProps>;

export function PasswordInputField({ name, autoFocused, inputProps, htmlProps, ref }: PasswordInputFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { register, modelValue, modelLoading, formVariant } = useFormField();
	const [showPassword, setShowPassword] = React.useState(false);

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const defaultInputProps = useDefaultInputProps(inputProps);
	useAutoFocus(autoFocused, ref, formVariant);

	const actionIcon = usePasswordToggle(showPassword, setShowPassword);

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			description={fieldData.description}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Input
				id={inputId}
				type={showPassword ? 'text' : 'password'}
				{...(() => {
					const registerResult = register(name);
					return {
						...registerResult,
						ref: (e: HTMLInputElement | null) => {
							if (typeof registerResult.ref === 'function') {
								registerResult.ref(e);
							}
							ref.current = e;
						},
					};
				})()}
				defaultValue={defaultValue}
				error={fieldData.error}
				disabled={modelLoading}
				placeholder={fieldData.placeholder}
				rightSectionPointerEvents='all'
				rightSection={actionIcon}
				ff='monospace'
				withAria={false}
				{...defaultInputProps}
				{...htmlProps}
			/>
		</BaseFieldWrapper>
	);
}

export type NumberInputFieldProps = BaseInputProps<NumberInputProps>;

export function NumberInputField({ name, autoFocused, inputProps, htmlProps, ref }: NumberInputFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, formVariant } = useFormField();

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>);
	useAutoFocus(autoFocused, ref, formVariant);

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			description={fieldData.description}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Controller
				name={name}
				control={control}
				defaultValue={defaultValue}
				render={({ field }) => {
					const value = field.value !== undefined ? field.value : defaultValue;
					return (
						<NumberInput
							id={inputId}
							error={fieldData.error}
							value={typeof value === 'number' ? value : undefined}
							onChange={(val) => field.onChange(typeof val === 'number' ? val : undefined)}
							onBlur={field.onBlur}
							name={field.name}
							ref={(e) => {
								field.ref(e);
								ref.current = e;
							}}
							disabled={modelLoading}
							placeholder={fieldData.placeholder}
							{...htmlProps}
							{...(defaultInputProps as NumberInputProps)}
						/>
					);
				}}
			/>
		</BaseFieldWrapper>
	);
}

export type DateInputFieldProps = BaseInputProps<DateInputProps>;

export function DateInputField({ name, autoFocused, inputProps, htmlProps, ref }: DateInputFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, formVariant } = useFormField();

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>);
	useAutoFocusById(autoFocused, inputId, formVariant);

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			description={fieldData.description}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Controller
				name={name}
				control={control}
				defaultValue={defaultValue}
				render={({ field }) => {
					let dateValue: Date | null = null;
					const valueToUse = field.value !== undefined ? field.value : defaultValue;

					if (valueToUse) {
						if (valueToUse instanceof Date) {
							dateValue = valueToUse;
						}
						else if (typeof valueToUse === 'string') {
							dateValue = new Date(valueToUse);
						}
					}

					return (
						<DateInput
							id={inputId}
							error={fieldData.error}
							value={dateValue}
							onChange={(date) => field.onChange(date || undefined)}
							disabled={modelLoading}
							placeholder={fieldData.placeholder}
							ref={ref}
							{...htmlProps}
							{...(defaultInputProps as DateInputProps)}
						/>
					);
				}}
			/>
		</BaseFieldWrapper>
	);
}

export type StaticEnumSelectFieldProps = BaseInputProps<SelectProps>;

export function StaticEnumSelectField({ name, autoFocused, inputProps, htmlProps, ref }: StaticEnumSelectFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, formVariant } = useFormField();

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>);
	const selectData = fieldData.fieldDef.enum!.map((opt) => ({
		value: opt.value,
		label: extractLabel(opt.label),
	}));

	useAutoFocusById(autoFocused, inputId, formVariant);

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			description={fieldData.description}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Controller
				name={name}
				control={control}
				defaultValue={defaultValue}
				render={({ field }) => {
					const value = field.value !== undefined ? field.value : defaultValue;
					return (
						<Select
							id={inputId}
							error={fieldData.error}
							data={selectData}
							value={(value as string) || null}
							onChange={field.onChange}
							disabled={modelLoading}
							placeholder={fieldData.placeholder}
							ref={ref}
							{...htmlProps}
							{...(defaultInputProps as SelectProps)}
						/>
					);
				}}
			/>
		</BaseFieldWrapper>
	);
}

export type DynamicEnumSelectFieldProps = BaseInputProps<SelectProps>;

export function DynamicEnumSelectField({
	name, autoFocused, inputProps, htmlProps, ref }: DynamicEnumSelectFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, formVariant } = useFormField();

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>);
	useAutoFocusById(autoFocused, inputId, formVariant);

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			description={fieldData.description}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Controller
				name={name}
				control={control}
				defaultValue={defaultValue}
				render={({ field }) => {
					const value = field.value !== undefined ? field.value : defaultValue;
					return (
						<Select
							id={inputId}
							error={fieldData.error}
							data={[]}
							value={(value as string) || null}
							onChange={field.onChange}
							placeholder={fieldData.placeholder || `TODO: Load from ${fieldData.fieldDef.enumSrc?.stateSource}`}
							disabled={modelLoading}
							ref={ref}
							{...htmlProps}
							{...(defaultInputProps as SelectProps)}
						/>
					);
				}}
			/>
		</BaseFieldWrapper>
	);
}
