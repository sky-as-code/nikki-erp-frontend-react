import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { buildValidationSchema } from './validation';
import { FieldDefinition, ModelSchema } from '../../model';


export type FormStyleContextValue = {
	layout: FormLayout;
};

export type FormLayout = 'onecol' | 'twocol';

const FormStyleContext = React.createContext<FormStyleContextValue | undefined>(undefined);

export function useFormStyle() {
	const context = React.useContext(FormStyleContext);
	if (context === undefined) {
		throw new Error('useFormStyle must be used within a FormStyleProvider');
	}
	return context;
};

// Form field context
type FormFieldContextValue = {
	control: ReturnType<typeof useForm>['control'];
	formVariant: 'create' | 'update';
	modelLoading?: boolean;
	modelSchema: ModelSchema;
	modelValue?: Record<string, any>;
	errors: ReturnType<typeof useForm>['formState']['errors'];
	register: ReturnType<typeof useForm>['register'];
	getFieldDef: (fieldName: string) => FieldDefinition | undefined;
};

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined);

export function useFormField() {
	const context = React.useContext(FormFieldContext);
	if (context === undefined) {
		throw new Error('useFormField must be used within a FormFieldProvider');
	}
	return context;
};

export function useFieldData(fieldName: string) {
	const { errors, getFieldDef, formVariant } = useFormField();
	const fieldDef = getFieldDef(fieldName);

	if (!fieldDef) {
		return null;
	}

	const label = extractLabel(fieldDef.label);
	const description = fieldDef.description ? extractLabel(fieldDef.description) : undefined;
	const placeholder = fieldDef.placeholder ? extractLabel(fieldDef.placeholder) : undefined;
	const isRequired = Boolean(fieldDef.required?.[formVariant]);
	const rawError = errors[fieldName]?.message as string | undefined;
	// Extract translation key from $ref format if present
	const error = rawError ? extractTranslationKey(rawError) : undefined;

	return {
		label,
		description,
		placeholder,
		isRequired,
		error,
		fieldDef,
	};
}

export type FormStyleProviderProps = React.PropsWithChildren & {
	layout: FormLayout;
};

export const FormStyleProvider: React.FC<FormStyleProviderProps> = ({ layout, children }) => (
	<FormStyleContext.Provider value={{ layout }}>
		{children}
	</FormStyleContext.Provider>
);

export type FormFieldProviderProps = {
	formVariant: 'create' | 'update';
	modelSchema: ModelSchema;
	modelValue?: Record<string, any>;
	modelLoading?: boolean;
	children: (props: {
		handleSubmit: (onValid: (data: any) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
		reset: () => void;
		form: UseFormReturn<any>;
	}) => React.ReactNode;
};

export const FormFieldProvider: React.FC<FormFieldProviderProps> = (props) => {
	const { formVariant, modelSchema, modelValue, modelLoading = false, children } = props;
	const zodSchema = React.useMemo(() => buildValidationSchema(modelSchema), [modelSchema]);
	type FormData = z.infer<typeof zodSchema>;

	const form = useForm<FormData>({
		resolver: zodResolver(zodSchema),
		defaultValues: modelValue || {},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const {
		control,
		formState: { errors },
		register,
		handleSubmit,
		reset,
	} = form;



	console.log('FormFieldProvider errors:', errors);


	// Reset form when modelValue changes
	React.useEffect(() => {
		if (modelValue) {
			reset(modelValue);
		}
	}, [modelValue, reset]);

	return (
		<FormFieldContext.Provider
			value={{
				control,
				errors,
				formVariant,
				modelSchema,
				modelValue,
				modelLoading,
				register,
				getFieldDef: (fieldName) => modelSchema.fields[fieldName],
			}}
		>
			{children({
				handleSubmit,
				reset,
				form,
			})}
		</FormFieldContext.Provider>
	);
};

export function extractLabel(labelRef: string): string {
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
}

/**
 * Extract full translation key from $ref format: { "$ref": "translation.key.path" }
 * Returns the full key path for i18n translation
 * If not a $ref format, returns the original string
 */
export function extractTranslationKey(ref: string): string {
	try {
		const parsed = JSON.parse(ref);
		if (parsed && parsed.$ref) {
			return parsed.$ref;
		}
	}
	catch {
		// If parsing fails, try to extract from string format with single quotes
		const match = ref.match(/'([^']+)'/);
		if (match) {
			return match[1];
		}
	}

	return ref;
}
