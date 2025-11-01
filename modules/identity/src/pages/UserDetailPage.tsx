import { zodResolver } from '@hookform/resolvers/zod';
import {
	ActionIcon,
	Box,
	Button,
	Grid,
	Input,
	NumberInput,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import React, { createContext, useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z, ZodNumber, ZodString } from 'zod';

import userSchema from '../user-schema.json';

// Type definitions for the schema
type FieldConstraint = {
	type: string;
	message?: string;
	min?: number | string;
	max?: number | string;
	allow_today?: boolean;
	allow_future?: boolean;
	allow_past?: boolean;
	fields?: string[];
};

type EnumOption = {
	value: string;
	label: string;
};

type EnumSource = {
	stateSource: string;
	key: string;
	label: string;
};

type FieldDefinition = {
	type: 'string' | 'email' | 'password' | 'date' | 'integer' | 'enum';
	label: string;
	required?: {
		create?: boolean;
		update?: boolean;
	};
	hidden?: boolean;
	frontendOnly?: boolean;
	constraints?: FieldConstraint[];
	enum?: EnumOption[];
	enumSrc?: EnumSource;
};

type UserSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

// Form style context
type FormLayout = 'onecol' | 'twocol';

type FormStyleContextValue = {
	layout: FormLayout;
};

const FormStyleContext = createContext<FormStyleContextValue | undefined>(undefined);

const useFormStyle = () => {
	const context = useContext(FormStyleContext);
	if (context === undefined) {
		throw new Error('useFormStyle must be used within a FormStyleProvider');
	}
	return context;
};

// Form field context
type FormFieldContextValue = {
	schema: UserSchema;
	pageVariant: 'create' | 'update';
	register: ReturnType<typeof useForm>['register'];
	control: ReturnType<typeof useForm>['control'];
	errors: ReturnType<typeof useForm>['formState']['errors'];
	getFieldDef: (fieldName: string) => FieldDefinition | undefined;
};

const FormFieldContext = createContext<FormFieldContextValue | undefined>(undefined);

const useFormField = () => {
	const context = useContext(FormFieldContext);
	if (context === undefined) {
		throw new Error('useFormField must be used within a FormFieldProvider');
	}
	return context;
};

// Helper function to extract label text from $ref format
const extractLabel = (labelRef: string): string => {
	try {
		const parsed = JSON.parse(labelRef);
		if (parsed && parsed.$ref) {
			// Extract the key from the $ref path
			const parts = parsed.$ref.split('.');
			return parts[parts.length - 1];
		}
	}
	catch {
		// If parsing fails, return as is or extract key
		const match = labelRef.match(/'([^']+)'/);
		return match ? match[1] : labelRef;
	}

	return labelRef;
};

// Hook to get field data (label, isRequired, error)
const useFieldData = (fieldName: string) => {
	const { errors, getFieldDef, pageVariant } = useFormField();
	const fieldDef = getFieldDef(fieldName);

	if (!fieldDef) {
		return null;
	}

	const label = extractLabel(fieldDef.label);
	const isRequired = Boolean(fieldDef.required?.[pageVariant]);
	const error = errors[fieldName]?.message as string | undefined;

	return {
		label,
		isRequired,
		error,
		fieldDef,
	};
};

// Base field wrapper component with Grid layout
const BaseFieldWrapper: React.FC<{
	inputId: string;
	label: string;
	isRequired: boolean;
	error: string | undefined;
	children: React.ReactNode;
}> = ({ inputId, label, isRequired, error, children }) => {
	const { layout } = useFormStyle();
	const twoColumnLayout = layout === 'twocol';

	return (
		<Grid grow gutter={0} mt='md'>
			<Grid.Col span={twoColumnLayout ? 4 : 12}>
				<Input.Label htmlFor={inputId}>
					{label}
					{isRequired && <Text component='span' c='red' ml={4}>*</Text>}
				</Input.Label>
			</Grid.Col>
			<Grid.Col span={twoColumnLayout ? 8 : 12}>
				{children}
				{error && <Input.Error>{error}</Input.Error>}
			</Grid.Col>
		</Grid>
	);
};

// Create base Zod schema from field type
const createBaseSchema = (fieldDef: FieldDefinition): z.ZodTypeAny => {
	switch (fieldDef.type) {
		case 'email':
			return z.string().email();
		case 'password':
			return z.string();
		case 'integer':
			return z.number().int();
		case 'date':
			return z.date().or(z.string().transform((str) => new Date(str)));
		case 'enum':
			if (fieldDef.enum) {
				const enumValues = fieldDef.enum.map((opt) => opt.value) as [string, ...string[]];
				return z.enum(enumValues);
			}

			return z.string();
		default:
			return z.string();
	}
};

// Apply length constraint to string schema
const applyLengthConstraint = (
	schema: ZodString,
	constraint: FieldConstraint,
	message?: string,
): ZodString => {
	const minValue = typeof constraint.min === 'number' ? constraint.min : undefined;
	const maxValue = typeof constraint.max === 'number' ? constraint.max : undefined;
	let stringSchema = schema;

	if (minValue !== undefined) {
		stringSchema = stringSchema.min(minValue, {
			message: message || `Minimum length is ${minValue}`,
		});
	}

	if (maxValue !== undefined) {
		stringSchema = stringSchema.max(maxValue, {
			message: message || `Maximum length is ${maxValue}`,
		});
	}

	return stringSchema;
};

// Apply value range constraint to number schema
const applyValueRangeConstraint = (
	schema: ZodNumber,
	constraint: FieldConstraint,
	message?: string,
): ZodNumber => {
	const minValue = typeof constraint.min === 'number' ? constraint.min : undefined;
	const maxValue = typeof constraint.max === 'number' ? constraint.max : undefined;
	let numberSchema = schema;

	if (minValue !== undefined) {
		numberSchema = numberSchema.min(minValue, {
			message: message || `Minimum value is ${minValue}`,
		});
	}

	if (maxValue !== undefined) {
		numberSchema = numberSchema.max(maxValue, {
			message: message || `Maximum value is ${maxValue}`,
		});
	}

	return numberSchema;
};

// Apply date range constraint
const applyDateRangeConstraint = (
	schema: z.ZodTypeAny,
	constraint: FieldConstraint,
	message?: string,
): z.ZodTypeAny => {
	const minDate = constraint.min ? new Date(constraint.min as string) : undefined;
	const maxDate = constraint.max ? new Date(constraint.max as string) : undefined;

	return schema.refine(
		(value: unknown) => {
			const date = value instanceof Date ? value : new Date(value as string);
			if (minDate && date < minDate) {
				return false;
			}

			if (maxDate && date > maxDate) {
				return false;
			}

			if (
				constraint.allow_today === false &&
				date.toDateString() === new Date().toDateString()
			) {
				return false;
			}

			if (constraint.allow_future === false && date > new Date()) {
				return false;
			}

			if (constraint.allow_past === false && date < new Date()) {
				return false;
			}

			return true;
		},
		{ message: message || 'Date is out of range' },
	);
};

// Apply a single constraint to a schema
const applyConstraint = (
	fieldSchema: z.ZodTypeAny,
	constraint: FieldConstraint,
): z.ZodTypeAny => {
	const message = constraint.message
		? extractLabel(constraint.message)
		: undefined;

	switch (constraint.type) {
		case 'required':
			if (fieldSchema instanceof ZodString) {
				return fieldSchema.min(1, { message: message || 'Required' });
			}

			return fieldSchema;
		case 'length':
			if (fieldSchema instanceof ZodString) {
				return applyLengthConstraint(fieldSchema, constraint, message);
			}

			return fieldSchema;
		case 'value_range':
			if (fieldSchema instanceof ZodNumber) {
				return applyValueRangeConstraint(fieldSchema, constraint, message);
			}

			return fieldSchema;
		case 'date_range':
			return applyDateRangeConstraint(fieldSchema, constraint, message);
		default:
			return fieldSchema;
	}
};

// Build Zod schema for a single field
const buildFieldSchema = (fieldDef: FieldDefinition): z.ZodTypeAny => {
	let fieldSchema = createBaseSchema(fieldDef);

	// Apply constraints
	if (fieldDef.constraints) {
		fieldDef.constraints.forEach((constraint) => {
			fieldSchema = applyConstraint(fieldSchema, constraint);
		});
	}

	// Make optional if not required
	const isRequired = fieldDef.required?.create || fieldDef.required?.update;
	if (!isRequired && !fieldDef.constraints?.some((c) => c.type === 'required')) {
		fieldSchema = fieldSchema.optional();
	}

	return fieldSchema;
};

// Build Zod schema from field constraints
const buildZodSchema = (schema: UserSchema): z.ZodObject<any> => {
	const shape: Record<string, z.ZodTypeAny> = {};

	Object.entries(schema.fields).forEach(([fieldName, fieldDef]) => {
		// Skip frontend-only fields in validation if needed, or hidden fields
		if (fieldDef.hidden && !fieldDef.frontendOnly) {
			return;
		}

		shape[fieldName] = buildFieldSchema(fieldDef);
	});

	return z.object(shape);
};

// Text input field component
const TextInputField: React.FC<{
	name: string;
	type: 'text' | 'email';
}> = ({ name, type }) => {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { register } = useFormField();

	if (!fieldData) {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Input id={inputId} type={type} {...register(name)} error={fieldData.error} />
		</BaseFieldWrapper>
	);
};

// Password input field component
const PasswordInputField: React.FC<{
	name: string;
}> = ({ name }) => {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { register } = useFormField();
	const [showPassword, setShowPassword] = useState(false);

	if (!fieldData) {
		return null;
	}

	const handleMouseDown = () => {
		setShowPassword(true);
	};

	const handleMouseUp = () => {
		setShowPassword(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === ' ') {
			e.preventDefault();
			setShowPassword(true);
		}
	};

	const handleKeyUp = (e: React.KeyboardEvent) => {
		if (e.key === ' ') {
			e.preventDefault();
			setShowPassword(false);
		}
	};

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Input
				id={inputId}
				type={showPassword ? 'text' : 'password'}
				{...register(name)}
				error={fieldData.error}
				rightSectionPointerEvents="all"
				rightSection={
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
				}
			/>
		</BaseFieldWrapper>
	);
};

// Number input field component
const NumberInputField: React.FC<{
	name: string;
}> = ({ name }) => {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control } = useFormField();

	if (!fieldData) {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<NumberInput
						id={inputId}
						error={fieldData.error}
						value={typeof field.value === 'number' ? field.value : undefined}
						onChange={(value) => field.onChange(typeof value === 'number' ? value : undefined)}
						onBlur={field.onBlur}
						name={field.name}
						ref={field.ref}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
};

// Date input field component
const DateInputField: React.FC<{
	name: string;
}> = ({ name }) => {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control } = useFormField();

	if (!fieldData) {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Controller
				name={name}
				control={control}
				render={({ field }) => {
					let dateValue: Date | null = null;

					if (field.value) {
						if (field.value instanceof Date) {
							dateValue = field.value;
						}
						else if (typeof field.value === 'string') {
							dateValue = new Date(field.value);
						}
					}

					return (
						<DateInput
							id={inputId}
							error={fieldData.error}
							value={dateValue}
							onChange={(date) => field.onChange(date || undefined)}
						/>
					);
				}}
			/>
		</BaseFieldWrapper>
	);
};

// Static enum select field component
const StaticEnumSelectField: React.FC<{
	name: string;
}> = ({ name }) => {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control } = useFormField();

	if (!fieldData) {
		return null;
	}

	const selectData = fieldData.fieldDef.enum!.map((opt) => ({
		value: opt.value,
		label: extractLabel(opt.label),
	}));

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<Select
						id={inputId}
						error={fieldData.error}
						data={selectData}
						value={(field.value as string) || null}
						onChange={field.onChange}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
};

// Dynamic enum select field component
const DynamicEnumSelectField: React.FC<{
	name: string;
}> = ({ name }) => {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control } = useFormField();

	if (!fieldData) {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={fieldData.label}
			isRequired={fieldData.isRequired}
			error={fieldData.error}
		>
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<Select
						id={inputId}
						error={fieldData.error}
						data={[]}
						value={(field.value as string) || null}
						onChange={field.onChange}
						placeholder={`TODO: Load from ${fieldData.fieldDef.enumSrc?.stateSource}`}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
};

// Main Field component that renders based on field type
const Field: React.FC<{
	name: string;
}> = ({ name }) => {
	const { getFieldDef } = useFormField();
	const fieldDef = getFieldDef(name);

	if (!fieldDef) {
		return null;
	}

	// Skip hidden fields
	if (fieldDef.hidden) {
		return null;
	}

	switch (fieldDef.type) {
		case 'string':
			return <TextInputField name={name} type='text' />;
		case 'email':
			return <TextInputField name={name} type='email' />;
		case 'password':
			return <PasswordInputField name={name} />;
		case 'integer':
			return <NumberInputField name={name} />;
		case 'date':
			return <DateInputField name={name} />;
		case 'enum':
			if (fieldDef.enum) {
				return <StaticEnumSelectField name={name} />;
			}
			if (fieldDef.enumSrc) {
				return <DynamicEnumSelectField name={name} />;
			}
			return null;
		default:
			return null;
	}
};

// Form style provider component
const FormStyleProvider: React.FC<{
	layout: FormLayout;
	children: React.ReactNode;
}> = ({ layout, children }) => (
	<FormStyleContext.Provider value={{ layout }}>
		{children}
	</FormStyleContext.Provider>
);

// Form field provider component
const FormFieldProvider: React.FC<{
	schema: UserSchema;
	pageVariant: 'create' | 'update';
	register: ReturnType<typeof useForm>['register'];
	control: ReturnType<typeof useForm>['control'];
	errors: ReturnType<typeof useForm>['formState']['errors'];
	children: React.ReactNode;
}> = ({ schema, pageVariant, register, control, errors, children }) => (
	<FormFieldContext.Provider
		value={{
			schema,
			pageVariant,
			register,
			control,
			errors,
			getFieldDef: (fieldName) => schema.fields[fieldName]
		}}
	>
		{children}
	</FormFieldContext.Provider>
);

export const UserDetailPage: React.FC = () => {
	const schema = userSchema as UserSchema;
	const zodSchema = buildZodSchema(schema);

	type FormData = z.infer<typeof zodSchema>;

	const form = useForm<FormData>({
		resolver: zodResolver(zodSchema),
		defaultValues: {},
	});

	const { register, control, handleSubmit, formState: { errors } } = form;

	const onSubmit = (data: FormData) => {
		console.log('Form submitted:', data);
	};

	return (
		<FormStyleProvider layout='twocol'>
			<FormFieldProvider pageVariant='create' schema={schema} register={register} control={control} errors={errors}>
				<Box p='md'>
					<form onSubmit={handleSubmit(onSubmit)} noValidate>
						<Stack gap='xs'>

							<Field name='id' />
							<Field name='email' />
							<Field name='password' />
							<Field name='passwordConfirm' />
							<Field name='dateOfBirth' />
							<Field name='dependantNum' />
							<Field name='gender' />
							<Field name='nationality' />
							<Button type='submit' mt='xl'>
								Submit
							</Button>
						</Stack>
					</form>
				</Box>
			</FormFieldProvider>
		</FormStyleProvider>
	);
};