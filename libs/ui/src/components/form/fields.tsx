import React, { createContext, useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FieldDefinition, FieldConstraint, FormLayout } from './types';
import { ActionIcon, Grid, Input, NumberInput, Select } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { extractLabel, useFieldData, useFormField, useFormStyle } from './formContext';


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
                    {/* {isRequired && <Text component='span' c='red' ml={4}>*</Text>} */}
                </Input.Label>
            </Grid.Col>
            <Grid.Col span={twoColumnLayout ? 8 : 12}>
                {children}
                {error && <Input.Error>{error}</Input.Error>}
            </Grid.Col>
        </Grid>
    );
};

export const TextInputField: React.FC<{
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

export const PasswordInputField: React.FC<{
    name: string;
}> = ({ name }) => {
    const inputId = useId();
    const fieldData = useFieldData(name);
    const { register } = useFormField();
    const [showPassword, setShowPassword] = React.useState(false);

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

export const NumberInputField: React.FC<{
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

export const DateInputField: React.FC<{
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

export const StaticEnumSelectField: React.FC<{
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

export const DynamicEnumSelectField: React.FC<{
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

export const AutoField: React.FC<{
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
