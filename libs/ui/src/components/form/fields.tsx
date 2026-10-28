import {
	ActionIcon, Grid, Input, NumberInput, Select, Switch, Text, VisuallyHidden, InputProps, NumberInputProps,
} from '@mantine/core';
import { DateInput, DateInputProps, DateTimePickerProps } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { useCreateDefault } from './createDefault';
import { DateTimeInputField, ReadOnlyTextField, TimeInputField } from './dateTimeFields';
import { fieldErrorText } from './fieldErrors';
import { FieldLabelProvider, useFieldLabelHidden } from './fieldLabelContext';
import { useFieldData, useFormField, useFormStyle } from './formContext';
import { useFieldPartTestAttrs, useFieldTestAttrs } from './formTestIds';
import { LangJsonField } from './LangJsonField';
import { isLongTextField, LongTextInput } from './longText';
import { RelationSelectField } from './RelationSelectField';
import { LocalizeFn, TranslateFn } from '../../i18n';
import { useFormInputSize } from '../Input/inlineControls';
import { formInputProps } from '../Input/inputDensity';


export type AutoFieldProps = {
	name: string,
	autoFocused?: boolean,
	inputProps?: Partial<InputProps>,
	htmlProps?: FilteredInputHTMLAttributes,
	ref?: React.RefObject<any>,
	translate?: TranslateFn,
	/**
	 * Hides the label row (and description) while keeping the label for screen readers; errors
	 * still show below the input. Unset inherits an enclosing `FieldLabelProvider`, else shown.
	 */
	labelHidden?: boolean,
};

export function AutoField(props: AutoFieldProps) {
	if (props.labelHidden === undefined) {
		return <AutoFieldControl {...props} />;
	}
	return (
		<FieldLabelProvider labelHidden={props.labelHidden}>
			<AutoFieldControl {...props} />
		</FieldLabelProvider>
	);
}

function AutoFieldControl(props: AutoFieldProps) {
	const { getFieldDef, localize, formVariant } = useFormField();
	const fieldDef = getFieldDef(props.name);
	const ref = React.useRef<HTMLInputElement | null>(null);
	const exclusiveDisabledBy = useExclusiveBlocker(props.name);
	useCreateDefault(props.name);

	if (!fieldDef) {
		console.warn(`Unrecognized field: ${props.name}`);
		return null;
	}

	// A field the server will not accept an update for is shown, not edited: rendering an input
	// would invite a change that silently fails to save.
	if (formVariant === 'update' && fieldDef.no_update) {
		return <ReadOnlyTextField name={props.name} localize={localize} />;
	}

	const identityOrTemporal = renderIdentityOrTemporalField({
		...props, fieldDef, localize, exclusiveDisabledBy, fallbackRef: ref,
	});
	if (identityOrTemporal !== undefined) {
		return identityOrTemporal;
	}

	switch (fieldDef.data_type.name) {
		// A slug is typed as text; its format is checked by the validation schema.
		case 'string':
		case 'nikkiSlug':
			return <TextInputField
				name={props.name} type='text' autoFocused={props.autoFocused}
				inputProps={props.inputProps} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
				localize={localize}
			/>;
		case 'email':
			return <TextInputField
				name={props.name} type='email' autoFocused={props.autoFocused}
				inputProps={props.inputProps} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
				localize={localize}
			/>;
		case 'secret':
			return <PasswordInputField
				name={props.name} autoFocused={props.autoFocused}
				inputProps={props.inputProps} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
				localize={localize}
			/>;
		case 'int32':
			return <NumberInputField
				name={props.name} autoFocused={props.autoFocused}
				inputProps={props.inputProps as Partial<NumberInputProps>} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
				localize={localize}
			/>;
		case 'nikkiDate':
			return <DateInputField
				name={props.name} autoFocused={props.autoFocused}
				inputProps={props.inputProps as Partial<DateInputProps>} htmlProps={props.htmlProps}
				ref={props.ref ?? ref}
				localize={localize}
			/>;
		case 'boolean':
			return <BooleanField name={props.name} inputProps={props.inputProps} localize={localize} />;
		case 'nikkiLangJson':
			return <LangJsonField name={props.name} inputProps={props.inputProps} localize={localize} />;
		case 'enumString':
			if (fieldDef.data_type.options?.enumValues) {
				return <StaticEnumSelectField
					name={props.name} autoFocused={props.autoFocused}
					inputProps={props.inputProps as Partial<SelectProps>} htmlProps={props.htmlProps}
					ref={props.ref ?? ref}
					localize={localize}
				/>;
			}
			// if (fieldDef.enumSrc) {
			// 	return <DynamicEnumSelectField
			// 		name={props.name} autoFocused={props.autoFocused}
			// 		inputProps={props.inputProps as Partial<SelectProps>} htmlProps={props.htmlProps}
			// 		ref={props.ref ?? ref}
			// 	/>;
			// }
			return null;
		default:
			console.warn(`Unknown field type: ${fieldDef.data_type.name}`);
			return null;
	}
}

type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;

type IdentityOrTemporalArgs = AutoFieldProps & {
	fieldDef: dyn.ModelSchemaField,
	localize: LocalizeFn,
	exclusiveDisabledBy?: string,
	fallbackRef: React.RefObject<HTMLInputElement | null>,
};

/**
 * The data types added after the original switch: ids, which may point at another record, the
 * temporal types, and `decimal`. Returns `undefined` — not `null` — when the type is none of
 * them, so the caller can tell "not handled here" from "handled, renders nothing".
 */
function renderIdentityOrTemporalField(args: IdentityOrTemporalArgs): React.ReactNode | undefined {
	const { fieldDef, localize, fallbackRef } = args;
	switch (fieldDef.data_type.name) {
		case 'decimal':
			return <DecimalInputField
				name={args.name} autoFocused={args.autoFocused}
				inputProps={args.inputProps as Partial<NumberInputProps>} htmlProps={args.htmlProps}
				ref={args.ref ?? fallbackRef}
				localize={localize}
				scale={fieldDef.data_type.options?.scale as number | undefined}
			/>;
		case 'ulid':
			return <UlidField
				name={args.name} localize={localize}
				inputProps={args.inputProps as Partial<SelectProps>}
				htmlProps={args.htmlProps} ref={args.ref ?? fallbackRef}
				exclusiveDisabledBy={args.exclusiveDisabledBy}
			/>;
		case 'nikkiDateTime':
			return <DateTimeInputField
				name={args.name} autoFocused={args.autoFocused}
				inputProps={args.inputProps as Partial<DateTimePickerProps>} htmlProps={args.htmlProps}
				ref={args.ref ?? fallbackRef}
				localize={localize}
			/>;
		case 'nikkiTime':
			return <TimeInputField
				name={args.name} autoFocused={args.autoFocused}
				inputProps={args.inputProps as Partial<InputProps>} htmlProps={args.htmlProps}
				ref={args.ref ?? fallbackRef}
				localize={localize}
			/>;
		default:
			return undefined;
	}
}

/**
 * Every field variant funnels its Mantine props through here, which makes it the one place that
 * has to name the input for tests. The id derives from the schema field name, so a field is
 * addressable without any call site passing anything; `FormTestIdProvider` adds the
 * `{module}.{component}` prefix that keeps two forms on one page apart.
 *
 * An explicit `data-testid` in `inputProps` still wins — it is spread after.
 *
 * It is also where a field gets the form input size (see {@link formInputProps}).
 */
function useDefaultInputProps(inputProps?: Partial<InputProps>, fieldName?: string): Partial<InputProps> {
	const fieldAttrs = useFieldTestAttrs(fieldName);
	const size = useFormInputSize();
	return React.useMemo(() => ({
		...fieldAttrs,
		...formInputProps(inputProps, size),
	}), [fieldAttrs, inputProps, size]);
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
	fieldName: string,
): React.ReactNode {
	const toggleAttrs = useFieldPartTestAttrs(fieldName, 'toggleVisibility');
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
			{...toggleAttrs}
		>
			{showPassword ? <IconEye size={20} /> : <IconEyeOff size={20} />}
		</ActionIcon>
	), [showPassword, handleMouseDown, handleMouseUp, handleKeyDown, handleKeyUp, toggleAttrs]);

	return actionIcon;
}


type BaseFieldWrapperProps = {
	inputId: string,
	label: string,
	description?: string,
	isRequired: boolean,
	error: string | undefined,
	children: React.ReactNode,
	ariaProps?: {
		'aria-labelledby': string,
		'aria-describedby'?: string,
		'aria-required'?: boolean,
		'aria-invalid'?: boolean,
	},
};

export function BaseFieldWrapper({
	inputId, label, description, isRequired, error, children, ariaProps,
}: BaseFieldWrapperProps) {
	const formStyle = useFormStyle();
	const labelHidden = useFieldLabelHidden();
	const twoColumnLayout = formStyle?.layout === 'twocol';
	const descriptionId = useId();
	const errorId = useId();
	const shownDescription = labelHidden ? undefined : description;

	const ariaDescribedBy = React.useMemo(() => {
		const ids: string[] = [];
		if (shownDescription) ids.push(descriptionId);
		if (error) ids.push(errorId);
		return ids.length > 0 ? ids.join(' ') : undefined;
	}, [shownDescription, error, descriptionId, errorId]);

	const labelId = `${inputId}-label`;

	const defaultAriaProps = React.useMemo(() => ({
		'aria-labelledby': labelId,
		'aria-describedby': ariaDescribedBy,
		'aria-required': isRequired || undefined,
		'aria-invalid': error ? true : undefined,
	}), [labelId, ariaDescribedBy, isRequired, error]);

	const fieldLabel = <FieldLabel inputId={inputId} labelId={labelId} label={label} isRequired={isRequired} />;
	const control = (
		<>
			{React.cloneElement(children as React.ReactElement, {
				...(ariaProps || defaultAriaProps),
			})}
			{error && <Input.Error id={errorId}>{error}</Input.Error>}
		</>
	);
	if (labelHidden) {
		return <div><VisuallyHidden>{fieldLabel}</VisuallyHidden>{control}</div>;
	}
	return (
		<Grid grow gap={0}>
			<Grid.Col span={twoColumnLayout ? 4 : 12}>
				{fieldLabel}
				{shownDescription && <Input.Description id={descriptionId}>{shownDescription}</Input.Description>}
			</Grid.Col>
			<Grid.Col span={twoColumnLayout ? 8 : 12}>
				{control}
			</Grid.Col>
		</Grid>
	);
}

type FieldLabelProps = { inputId: string, labelId: string, label: string, isRequired: boolean };

function FieldLabel({ inputId, labelId, label, isRequired }: FieldLabelProps) {
	return (
		<Input.Label htmlFor={inputId} id={labelId}>
			{label}
			{isRequired && <Text component='span' c='red' ml={4}>*</Text>}
		</Input.Label>
	);
}

type FilteredInputHTMLAttributes = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	'size' | 'type' | 'onChange' | 'onBlur' | 'value' | 'defaultValue' | 'name' | 'id' | 'ref' | 'disabled' | 'min' | 'max' | 'step'
>;

type BaseInputProps<TInputProp> = {
	name: string,
	autoFocused?: boolean,
	inputProps?: Partial<TInputProp>,
	htmlProps?: FilteredInputHTMLAttributes,
	ref: React.RefObject<HTMLInputElement | null>,
	localize: LocalizeFn,
};

export type TextInputFieldProps = BaseInputProps<InputProps> & {
	type: 'text' | 'email',
};

export function TextInputField(props: TextInputFieldProps) {
	const { name, type, autoFocused, inputProps, htmlProps, ref } = props;
	const t = props.localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { register, modelValue, modelLoading, formVariant } = useFormField();
	const defaultInputProps = useDefaultInputProps(inputProps, name);
	useAutoFocus(autoFocused, ref, formVariant);

	// Hooks stay above the guard: a field the current record has no data for must render nothing
	// without changing how many hooks this component called, or React tears down the whole form
	// with "rendered fewer hooks than expected".
	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const registerResult = register(name);
	const registerRef = (element: HTMLInputElement | null) => {
		if (typeof registerResult.ref === 'function') {
			registerResult.ref(element);
		}
		ref.current = element;
	};

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
		>
			{type === 'text' && isLongTextField(fieldData.fieldDef) ? (
				<LongTextInput
					id={inputId}
					{...registerResult}
					ref={registerRef as unknown as React.Ref<HTMLTextAreaElement>}
					defaultValue={defaultValue}
					error={fieldData.error}
					disabled={modelLoading}
					placeholder={t(fieldData.placeholder)}
					size={defaultInputProps.size}
					{...fieldTestAttrsOf(defaultInputProps)}
				/>
			) : (
				<Input
					id={inputId}
					type={type}
					{...registerResult}
					ref={registerRef}
					defaultValue={defaultValue}
					error={fieldData.error}
					disabled={modelLoading}
					placeholder={t(fieldData.placeholder)}
					withAria={false}
					{...htmlProps}
					{...defaultInputProps}
				/>
			)}
		</BaseFieldWrapper>
	);
}

/** The `data-testid` the field's default input props carry, for an input that takes no density classes. */
function fieldTestAttrsOf(props: Partial<InputProps>): Record<string, unknown> {
	const testId = (props as Record<string, unknown>)['data-testid'];
	return testId === undefined ? {} : { 'data-testid': testId };
}

export type PasswordInputFieldProps = BaseInputProps<InputProps>;

export function PasswordInputField(props: PasswordInputFieldProps) {
	const { name, autoFocused, inputProps, htmlProps, ref } = props;
	const t = props.localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { register, modelValue, modelLoading, formVariant } = useFormField();
	const [showPassword, setShowPassword] = React.useState(false);
	const defaultInputProps = useDefaultInputProps(inputProps, name);
	useAutoFocus(autoFocused, ref, formVariant);
	const actionIcon = usePasswordToggle(showPassword, setShowPassword, name);

	// Hooks stay above the guard: a field the current record has no data for must render nothing
	// without changing how many hooks this component called, or React tears down the whole form
	// with "rendered fewer hooks than expected".
	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
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
				placeholder={t(fieldData.placeholder)}
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

export function NumberInputField(props: NumberInputFieldProps) {
	const { name, autoFocused, inputProps, htmlProps, ref } = props;
	const t = props.localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, formVariant } = useFormField();

	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>, name);
	useAutoFocus(autoFocused, ref, formVariant);

	// Hooks stay above the guard: a field the current record has no data for must render nothing
	// without changing how many hooks this component called, or React tears down the whole form
	// with "rendered fewer hooks than expected".
	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
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
							error={fieldErrorText(t, fieldData)}
							value={typeof value === 'number' ? value : undefined}
							onChange={(val) => field.onChange(typeof val === 'number' ? val : undefined)}
							onBlur={field.onBlur}
							name={field.name}
							ref={(e) => {
								field.ref(e);
								ref.current = e;
							}}
							disabled={modelLoading}
							placeholder={fieldData.placeholder ? t(fieldData.placeholder) : undefined}
							{...htmlProps}
							{...(defaultInputProps as NumberInputProps)}
						/>
					);
				}}
			/>
		</BaseFieldWrapper>
	);
}

export type DecimalInputFieldProps = BaseInputProps<NumberInputProps> & {
	/** Digits after the decimal point the schema allows, from `data_type.options.scale`. */
	scale?: number,
};

/**
 * A `decimal` is carried as a **string** end to end, never as a JavaScript number.
 *
 * The backend sends values such as `0.453592` and `1000000000000` that a float64 cannot hold
 * exactly, and the UoM conversion rules depend on them surviving unchanged. `NumberInputField`
 * is therefore not reusable here: it coerces through `typeof value === 'number'` and would
 * blank out a string value and drop the user's edit.
 */
export function DecimalInputField(props: DecimalInputFieldProps) {
	const { name, autoFocused, inputProps, htmlProps, ref, scale } = props;
	const t = props.localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, formVariant } = useFormField();

	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>, name);
	useAutoFocus(autoFocused, ref, formVariant);

	// Hooks stay above the guard: a field the current record has no data for must render nothing
	// without changing how many hooks this component called, or React tears down the whole form
	// with "rendered fewer hooks than expected".
	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
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
							error={fieldErrorText(t, fieldData)}
							value={value ?? ''}
							// Mantine hands back a string while typing and a number once the value
							// parses. Normalising to string keeps precision the number never had.
							onChange={(val) => field.onChange(val === '' ? undefined : String(val))}
							onBlur={field.onBlur}
							name={field.name}
							ref={(e) => {
								field.ref(e);
								ref.current = e;
							}}
							disabled={modelLoading}
							decimalScale={scale}
							placeholder={fieldData.placeholder ? t(fieldData.placeholder) : undefined}
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

export function DateInputField(props: DateInputFieldProps) {
	const { name, autoFocused, inputProps, htmlProps, ref } = props;
	const t = props.localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, formVariant } = useFormField();

	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>, name);
	useAutoFocusById(autoFocused, inputId, formVariant);

	// Hooks stay above the guard: a field the current record has no data for must render nothing
	// without changing how many hooks this component called, or React tears down the whole form
	// with "rendered fewer hooks than expected".
	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
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
							onBlur={field.onBlur}
							disabled={modelLoading}
							placeholder={t(fieldData.placeholder)}
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

export function StaticEnumSelectField(props: StaticEnumSelectFieldProps) {
	const { name, autoFocused, inputProps, htmlProps, ref } = props;
	const t = props.localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, formVariant } = useFormField();

	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>, name);
	useAutoFocusById(autoFocused, inputId, formVariant);

	// Hooks stay above the guard: a field the current record has no data for must render nothing
	// without changing how many hooks this component called, or React tears down the whole form
	// with "rendered fewer hooks than expected".
	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name];
	const enumValues = fieldData.fieldDef.data_type.options?.enumValues as string[];
	const selectData = enumValues.map((val) => ({
		value: val,
		label: t(dyn.newLangJsonRef(
			`${fieldData.fieldDef.name}.${val}`,
		)),
	}));

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={t(fieldData.label)}
			isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
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
							// fix: duplicate error
							// error={fieldData.error}
							data={selectData}
							value={(value as string) || null}
							onChange={(val) => {
								// Transform null or empty string to undefined for optional enum
								field.onChange(val === null || val === '' ? undefined : val);
							}}
							onBlur={field.onBlur}
							disabled={modelLoading}
							placeholder={t(fieldData.placeholder)}
							// A clear lands as undefined; the update payload turns a cleared field into null.
							clearable={!fieldData.isRequired}
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

// export function DynamicEnumSelectField({
// 	name, autoFocused, inputProps, htmlProps, ref }: DynamicEnumSelectFieldProps) {
// 	const inputId = useId();
// 	const fieldData = useFieldData(name);
// 	const { t: translate } = useTranslation();
// 	const { control, modelValue, modelLoading, formVariant } = useFormField();

// 	if (!fieldData) {
// 		return null;
// 	}

// 	const defaultValue = modelValue?.[name];
// 	const defaultInputProps = useDefaultInputProps(inputProps as Partial<InputProps>, name);
// 	useAutoFocusById(autoFocused, inputId, formVariant);

// 	return (
// 		<BaseFieldWrapper
// 			inputId={inputId}
// 			label={translate(fieldData.label)}
// 			description={translate(fieldData.description ?? '')}
// 			isRequired={fieldData.isRequired}
// 			error={translate(fieldData.error ?? '')}
// 		>
// 			<Controller
// 				name={name}
// 				control={control}
// 				defaultValue={defaultValue}
// 				render={({ field }) => {
// 					const value = field.value !== undefined ? field.value : defaultValue;
// 					return (
// 						<Select
// 							id={inputId}
// 							// fix: duplicate error
// 							// error={fieldData.error}
// 							data={[]}
// 							value={(value as string) || null}
// 							onChange={(val) => {
// 								// Transform null or empty string to undefined for optional enum
// 								field.onChange(val === null || val === '' ? undefined : val);
// 							}}
// 							placeholder={fieldData.placeholder || `TODO: Load from ${fieldData.fieldDef.enumSrc?.stateSource}`}
// 							disabled={modelLoading}
// 							ref={ref}
// 							{...htmlProps}
// 							{...(defaultInputProps as SelectProps)}
// 						/>
// 					);
// 				}}
// 			/>
// 		</BaseFieldWrapper>
// 	);
// }

export type BooleanFieldProps = {
	name: string,
	inputProps?: Partial<InputProps>,
	localize: LocalizeFn,
};

export function BooleanField(props: BooleanFieldProps) {
	const { name, inputProps } = props;
	const t = props.localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading } = useFormField();
	const fieldAttrs = useFieldTestAttrs(name);

	if (!fieldData) {
		return null;
	}

	const defaultValue = modelValue?.[name] ?? false;

	// Label above the switch, through the same wrapper as every other field, so a form column
	// reads as one stack of label/control pairs rather than a switch with its label beside it.
	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			render={({ field }) => (
				<BaseFieldWrapper
					inputId={inputId}
					label={t(fieldData.label)}
					isRequired={fieldData.isRequired}
					error={fieldErrorText(t, fieldData)}
				>
					<Switch
						id={inputId}
						checked={field.value !== undefined ? Boolean(field.value) : Boolean(defaultValue)}
						onChange={(e) => field.onChange(e.currentTarget.checked)}
						onBlur={field.onBlur}
						disabled={modelLoading || inputProps?.disabled}
						size='md'
						{...fieldAttrs}
					/>
				</BaseFieldWrapper>
			)}
		/>
	);
}

export type UlidFieldProps = {
	name: string,
	localize: LocalizeFn,
	inputProps?: Partial<SelectProps>,
	htmlProps?: FilteredInputHTMLAttributes,
	ref: React.RefObject<HTMLInputElement | null>,
	exclusiveDisabledBy?: string,
};

/**
 * A `ulid` is either a foreign key or a bare identifier, and the schema says which: a field listed
 * as the `src_field` of an outgoing relation points at another record and gets a picker, while one
 * that is not — `org_id` on a role, for instance — is just an id the user types.
 */
export function UlidField(props: UlidFieldProps) {
	const { crudSchema } = useFormField();
	const modelSchema = crudSchema?.modelSchema;
	const relation = modelSchema ? dyn.findRelationBySrcField(modelSchema, props.name) : undefined;

	if (relation) {
		return <RelationSelectField
			name={props.name}
			localize={props.localize}
			inputProps={props.inputProps}
			exclusiveDisabledBy={props.exclusiveDisabledBy}
		/>;
	}

	return <TextInputField
		name={props.name} type='text'
		inputProps={props.inputProps as Partial<InputProps>} htmlProps={props.htmlProps}
		ref={props.ref}
		localize={props.localize}
	/>;
}

/**
 * The peer field, in an exclusive group with `fieldName`, that already holds a value — meaning
 * this field must not be filled too. Undefined when the field is free to edit.
 *
 * The backend rejects a group with zero or several members set; disabling the peers keeps the user
 * from building a request it is going to refuse. Clearing is left to the user, so a value is never
 * silently discarded.
 */
export function useExclusiveBlocker(fieldName: string): string | undefined {
	const { crudSchema, control } = useFormField();
	const modelSchema = crudSchema?.modelSchema;
	const peers = React.useMemo(
		() => (modelSchema ? dyn.findExclusiveGroupPeers(modelSchema, fieldName) : []),
		[modelSchema, fieldName],
	);
	// Called unconditionally with a possibly-empty list, since hooks cannot be skipped.
	const peerValues = useWatch({ control, name: peers }) as unknown[];

	if (peers.length === 0) {
		return undefined;
	}
	const filledIndex = peerValues.findIndex(value => value !== undefined && value !== null && value !== '');
	return filledIndex >= 0 ? peers[filledIndex] : undefined;
}
