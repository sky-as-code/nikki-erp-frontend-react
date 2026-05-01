import { zodResolver } from '@hookform/resolvers/zod';
import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';

import { type ReduxThunkState } from '../../appState/reduxActionState';
import { useDynamicModel } from '../../hooks/useDynamicModel';
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

	const label = extractLabel(fieldDef.label);
	const description = fieldDef.description ? extractLabel(fieldDef.description) : undefined;
	const placeholder = fieldDef.placeholder ? extractLabel(fieldDef.placeholder) : undefined;
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

// export type CrudCreateFormProviderProps = BaseFormProviderProps & {
// 	schemaName: string,

// 	// Redux action to submit form data
// 	submitAction: (data: any) => any,
// 	// Selector to get state of the submitAction
// 	submitActionSelector?: (state: any) => any,
// };

// export function CrudCreateFormProvider(props: CrudCreateFormProviderProps): React.ReactNode {
// 	const { children } = props;
// 	const [schemaPack, setSchemaPack] = React.useState<dyn.SchemaPack | null>(null);
// 	const dispatch = useMicroAppDispatch();

// 	React.useEffect(() => {
// 		if (props.schemaName) {
// 			dyn.schemaRegistry.get(props.schemaName).then((schemaPack) => {
// 				setSchemaPack(schemaPack);
// 			});
// 		}
// 	}, [props.schemaName]);

// 	if (!schemaPack) {
// 		return <LoadingState />;
// 	}

// 	const form = useForm({
// 		resolver: zodResolver(schemaPack.validationSchema),
// 		mode: 'onChange',
// 		reValidateMode: 'onChange',
// 	});

// 	const {
// 		control,
// 		formState: { errors },
// 		register,
// 		handleSubmit,
// 		reset,
// 	} = form;

// 	return schemaPack ? (
// 		<FormFieldContext.Provider
// 			value={{
// 				control,
// 				errors,
// 				formVariant: 'create',
// 				crudSchema: schemaPack,
// 				modelSchema: schemaPack.modelSchema,
// 				register,
// 				getFieldDef: (fieldName) => schemaPack?.modelSchema?.fields[fieldName],
// 			}}
// 		>
// 			{children({
// 				handleSubmit: (onValid: HandleSubmitOnValid): SubmitEventHandler =>{
// 					return handleSubmit((data) => {
// 						const postprocessed = onValid(data);
// 						if (postprocessed) {
// 							dispatch(props.submitAction(postprocessed));
// 						}
// 					});
// 				},
// 				reset,
// 				form,
// 				isLoading: false,
// 			})}
// 		</FormFieldContext.Provider>
// 	) : <LoadingState />;
// };

// export type CrudUpdateFormProviderProps = BaseFormProviderProps & {
// 	schemaName: string,

// 	// Selector to get form field values
// 	dataSelector: (state: any) => any,
// 	// Redux action to load form field values
// 	loadDataAction: () => any,
// 	// Redux action to submit form data
// 	submitAction: (data: any) => any,
// 	// Selector to get state of the submitAction
// 	submitActionSelector: (state: any) => ReduxActionState,
// };

// export function CrudUpdateFormProvider(props: CrudUpdateFormProviderProps): React.ReactNode {
// 	const { children } = props;
// 	const [schemaPack, setSchemaPack] = React.useState<dyn.SchemaPack | null>(null);
// 	const modelValue = useMicroAppSelector(props.dataSelector);
// 	const actionState = useMicroAppSelector(props.submitActionSelector) as ReduxActionState;
// 	const dispatch = useMicroAppDispatch();

// 	React.useEffect(() => {
// 		if (props.schemaName) {
// 			dyn.schemaRegistry.get(props.schemaName).then((schemaPack) => {
// 				setSchemaPack(schemaPack);
// 			});
// 		}
// 	}, [props.schemaName]);

// 	React.useEffect(() => {
// 		dispatch(props.loadDataAction());
// 	}, [dispatch]);

// 	if (!schemaPack) {
// 		return <LoadingState />;
// 	}

// 	const form = useForm({
// 		resolver: zodResolver(schemaPack.validationSchema),
// 		defaultValues: modelValue || {},
// 		mode: 'onChange',
// 		reValidateMode: 'onChange',
// 	});

// 	const {
// 		control,
// 		formState: { errors },
// 		register,
// 		handleSubmit,
// 		reset,
// 	} = form;

// 	// Reset form when modelValue changes
// 	React.useEffect(() => {
// 		if (schemaPack && modelValue) {
// 			reset(modelValue);
// 		}
// 	}, [schemaPack, modelValue, reset]);

// 	return schemaPack ? (
// 		<FormFieldContext.Provider
// 			value={{
// 				control,
// 				errors,
// 				formVariant: 'update',
// 				crudSchema: schemaPack,
// 				modelSchema: schemaPack.modelSchema,
// 				register,
// 				getFieldDef: (fieldName) => schemaPack?.modelSchema?.fields[fieldName],
// 			}}
// 		>
// 			{children({
// 				handleSubmit: (onValid: HandleSubmitOnValid): SubmitEventHandler =>{
// 					return handleSubmit((data) => {
// 						const postprocessed = onValid(data);
// 						if (postprocessed) {
// 							dispatch(props.submitAction(postprocessed));
// 						}
// 					});
// 				},
// 				reset,
// 				form,
// 				isLoading: actionState.status === 'pending',
// 			})}
// 		</FormFieldContext.Provider>
// 	) : <LoadingState />;
// };

export type CrudFormProviderProps = BaseFormProviderProps & {
	schemaName: string,
	formVariant: FormVariant;

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
	const { children } = props;
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
				crudSchema: schemaPack,
				modelSchema: schemaPack.modelSchema,
				register,
				getFieldDef: (fieldName) => schemaPack?.modelSchema?.fields[fieldName],
			}}
		>
			{children({
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
				isLoading: actionState.status === 'pending',
			})}
		</FormFieldContext.Provider>
	) : <LoadingState />;
};

export type AdhocFormProviderProps = BaseFormProviderProps & {
	formVariant: FormVariant;
	modelSchema: dyn.ModelSchema,
	modelValue?: Record<string, any>;
	modelLoading?: boolean;
};

export function AdhocFormProvider(props: AdhocFormProviderProps): React.ReactNode {
	const { formVariant, modelSchema, modelValue, modelLoading = false, children } = props;
	const zodSchema = React.useMemo(() => dyn.buildValidationSchema(modelSchema), [modelSchema]);

	const form = useForm({
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

	// Reset form when modelValue changes
	React.useEffect(() => {
		if (zodSchema && modelValue) {
			reset(modelValue);
		}
	}, [zodSchema, modelValue, reset]);

	return (
		<FormFieldContext.Provider
			value={{
				control,
				errors,
				formVariant,
				adhocSchema: {
					modelSchema,
				},
				modelSchema,
				modelValue,
				modelLoading,
				register,
				getFieldDef: (fieldName) => modelSchema.fields[fieldName],
			}}
		>
			(schemaPack ? {children({
				handleSubmit,
				reset,
				form,
				isLoading: false,
			})} : <LoadingState />)
		</FormFieldContext.Provider>
	);
};

export function extractLabel(label: dyn.ModelSchemaLangJson | undefined): string {
	if (!label) return '';
	return label['en-US'];
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