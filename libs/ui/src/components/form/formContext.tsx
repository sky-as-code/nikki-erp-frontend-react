import React from "react";
import { useForm } from "react-hook-form";

import { FieldDefinition, ModelSchema } from "../../model";


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
    schema: ModelSchema;
    pageVariant: 'create' | 'update';
    register: ReturnType<typeof useForm>['register'];
    control: ReturnType<typeof useForm>['control'];
    errors: ReturnType<typeof useForm>['formState']['errors'];
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
}

export const FormStyleProvider: React.FC<{
    layout: FormLayout;
    children: React.ReactNode;
}> = ({ layout, children }) => (
    <FormStyleContext.Provider value={{ layout }}>
        {children}
    </FormStyleContext.Provider>
);

export const FormFieldProvider: React.FC<{
    schema: ModelSchema;
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
