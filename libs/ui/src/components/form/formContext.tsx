import { zodResolver } from '@hookform/resolvers/zod';
import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';

import { type ReduxThunkState } from '../../appState/reduxActionState';
import { useDynamicModel } from '../../hookhoc/useDynamicModel';
import { LocalizeFn } from '../../i18n';
import { useMicroAppDispatch, useMicroAppSelector } from '../../microApp';
import { LoadingState } from '../Loading';


export type FormStyleContextValue = {
	layout: FormLayout,
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
	control: ReturnType<typeof useForm>['control'],
	formVariant: 'create' | 'update',
	crudSchema?: dyn.SchemaPack,
	adhocSchema?: {
		modelSchema: dyn.ModelSchema,
	},
	/**
	 * @deprecated
	 */
	modelSchema: any;
	modelLoading?: boolean,
	modelValue?: Record<string, any>,
	errors: ReturnType<typeof useForm>['formState']['errors'],
	register: ReturnType<typeof useForm>['register'],
	getFieldDef: (fieldName: string) => dyn.ModelSchemaField | undefined,
	localize: LocalizeFn,
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
	const { errors, getFieldDef, formVariant, crudSchema } = useFormField();
	const fieldDef = getFieldDef(fieldName);

	if (!fieldDef) {
		return null;
	}

	const label = fieldDef.label;
	const description = fieldDef.description ? fieldDef.description : undefined;
	const placeholder = fieldDef.placeholder ? fieldDef.placeholder : undefined;
	const isRequired = Boolean((fieldDef as any)['is_required_for_' + formVariant]);
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
		schemaName: crudSchema?.schemaName,
	};
}

export type FormStyleProviderProps = React.PropsWithChildren & {
	layout: FormLayout;
};

export function FormStyleProvider(props: FormStyleProviderProps): React.ReactNode {
	const { layout, children } = props;
	return (
		<FormStyleContext.Provider value={{ layout }}>
			{children}
		</FormStyleContext.Provider>
	);
}

type HandleSubmitOnValid = (data: any) => any;
type SubmitEventHandler = (e?: React.BaseSyntheticEvent) => Promise<void>;
type HandleSubmitFn = (onValid: HandleSubmitOnValid) => SubmitEventHandler;

export type FormProviderRenderProps = {
	/**
	 * Accepts a function to process the form data before submitting.
	 * If the function returns a value, it will be submitted to the server.
	 * If the function returns null or undefined, the form data will not be submitted.
	 */
	handleSubmit: HandleSubmitFn,
	reset: () => void,
	form: UseFormReturn<any>,
	isLoading: boolean,
};

type BaseFormProviderProps = {
	children: (props: FormProviderRenderProps) => React.ReactNode;
};

export type FormVariant = 'create' | 'update';

export type CrudFormProviderProps = BaseFormProviderProps & {
	schemaName: string,
	formVariant: FormVariant;
	localize: LocalizeFn;

	// Selector to get form field values
	dataSelector?: (state: any) => any,
	// Redux action to load form field values
	loadDataAction?: () => any,
	// Redux action to submit form data
	submitAction: (data: any) => any,
	// Selector to get state of the submitAction
	submitActionSelector: (state: any) => ReduxThunkState,
};

export function CrudFormProvider(props: CrudFormProviderProps): React.ReactNode {
	const schemaPack = useDynamicModel(props.schemaName);
	const modelValue = useMicroAppSelector(props.dataSelector ?? null);
	const actionState = useMicroAppSelector(props.submitActionSelector) as ReduxThunkState;
	const dispatch = useMicroAppDispatch();

	React.useEffect(() => {
		if (props.loadDataAction) {
			dispatch(props.loadDataAction());
		}
	}, [dispatch, props.loadDataAction]);

	const form = useForm({
		resolver: schemaPack ? zodResolver(schemaPack.validationSchema) : undefined,
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

	// Reset form when modelValue changes
	React.useEffect(() => {
		if (schemaPack && modelValue) {
			reset(modelValue);
		}
	}, [schemaPack, modelValue, reset]);

	return schemaPack ? (
		<FormFieldContext.Provider
			value={{
				control,
				errors,
				formVariant: props.formVariant,
				localize: props.localize,
				crudSchema: schemaPack,
				modelSchema: schemaPack.modelSchema,
				register,
				getFieldDef: (fieldName) => schemaPack?.modelSchema?.fields[fieldName],
			}}
		>
			{props.children({
				handleSubmit: (onValid: HandleSubmitOnValid): SubmitEventHandler =>{
					return handleSubmit((data) => {
						const postprocessed = onValid(data);
						if (postprocessed) {
							dispatch(props.submitAction(postprocessed));
						}
					});
				},
				reset,
				form,
				isLoading: actionState.isLoading,
			})}
		</FormFieldContext.Provider>
	) : <LoadingState />;
};

export type AdhocFormProviderProps = BaseFormProviderProps & {
	formVariant: FormVariant;
	modelSchema: dyn.ModelSchema,
	localize: LocalizeFn,
	modelValue?: Record<string, any>;
	modelLoading?: boolean;
};

export function AdhocFormProvider(props: AdhocFormProviderProps): React.ReactNode {
	const { modelLoading = false } = props;
	const zodSchema = React.useMemo(() => dyn.buildValidationSchema(props.modelSchema), [props.modelSchema]);

	const form = useForm({
		resolver: zodResolver(zodSchema),
		defaultValues: props.modelValue || {},
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

	// Reset form when modelValue changes
	React.useEffect(() => {
		if (zodSchema && props.modelValue) {
			reset(props.modelValue);
		}
	}, [zodSchema, props.modelValue, reset]);

	return (
		<FormFieldContext.Provider
			value={{
				control,
				errors,
				formVariant: props.formVariant,
				localize: props.localize,
				adhocSchema: {
					modelSchema: props.modelSchema,
				},
				modelSchema: props.modelSchema,
				modelValue: props.modelValue,
				modelLoading,
				register,
				getFieldDef: (fieldName) => props.modelSchema.fields[fieldName],
			}}
		>
			{props.modelLoading ? <LoadingState /> : props.children({
				handleSubmit,
				reset,
				form,
				isLoading: false,
			})}
		</FormFieldContext.Provider>
	);
};

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

export type FormFieldProviderProps = {
	formVariant: 'create' | 'update';
	modelSchema: any;
	modelValue?: Record<string, any>;
	modelLoading?: boolean;
	children: (props: {
		handleSubmit: (onValid: (data: any) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
		reset: () => void;
		form: UseFormReturn<any>;
	}) => React.ReactNode;
};

/**
 * @deprecated Use {@link AdhocFormProvider} instead.
 */
export const FormFieldProvider: React.FC<FormFieldProviderProps> = (props) => {
	const { formVariant, modelSchema, modelValue, modelLoading = false, children } = props;
	// const zodSchema = React.useMemo(() => buildValidationSchema(modelSchema), [modelSchema]);
	// type FormData = z.infer<typeof zodSchema>;

	const form = useForm({
		// resolver: zodResolver(zodSchema),
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
				localize: null as any,
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