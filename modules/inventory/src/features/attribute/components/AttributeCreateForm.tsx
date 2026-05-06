import { ActionIcon, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useId } from '@mantine/hooks';
import {
	AutoField,
	BaseFieldWrapper,
	FormContainer,
	FormFieldProvider,
	FormStyleProvider,
	useFieldData,
	useFormField,
} from '@nikkierp/ui/components/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import attributeSchema from '../../../schemas/attribute-schema.json';
import { StringToJson } from '../../../utils/serializer';

import type { CreateAttributeRequest } from '../types';
import type { ModelSchema } from '@nikkierp/ui/model';


export type AttributeCreateSubmitPayload = Omit<CreateAttributeRequest, 'orgId' | 'productId'>;

interface AttributeCreateFormProps {
	isLoading: boolean;
	onSubmit: (data: AttributeCreateSubmitPayload) => void | Promise<void>;
	formId?: string;
}

const ATTRIBUTE_CREATE_SCHEMA = attributeSchema as ModelSchema;

interface EnumValueFieldProps {
	dataType: string | undefined;
	value: string[];
	onChange: (value: string[]) => void;
	error?: string;
	disabled?: boolean;
}

function EnumValueField({ dataType, value, onChange, error, disabled }: EnumValueFieldProps): React.ReactElement | null {
	const { t: translate } = useTranslation();
	const inputId = useId();
	const fieldData = useFieldData('enumValue');

	if (!fieldData) return null;

	const isNumber = dataType === 'number';
	const placeholder = isNumber ? translate('nikki.inventory.attribute.enumValueForm.placeholder.number') : translate('nikki.inventory.attribute.enumValueForm.placeholder.text');

	const addItem = () => onChange([...value, '']);
	const removeItem = (i: number) => onChange(value.filter((_, idx) => idx !== i));
	const updateItem = (i: number, v: string) =>
		onChange(value.map((item, idx) => (idx === i ? v : item)));

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			isRequired={true}
			error={error}
		>
			<Stack gap='xs'>
				{value.length === 0 && (
					<Text size='sm' c='dimmed'>{translate('nikki.inventory.attribute.enumValueForm.noValues')} {translate('nikki.inventory.attribute.enumValueForm.noValuesHint')}</Text>
				)}
				{value.map((item, i) => (
					<Group key={i} gap='xs' wrap='nowrap'>
						<TextInput
							value={item}
							onChange={(e) => updateItem(i, e.currentTarget.value)}
							placeholder={placeholder}
							type={isNumber ? 'number' : 'text'}
							disabled={disabled}
							size='md'
							flex={1}
						/>
						<ActionIcon
							variant='subtle'
							color='red'
							size='lg'
							disabled={disabled}
							onClick={() => removeItem(i)}
							aria-label={translate('nikki.inventory.attribute.enumValueForm.removeValue')}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Group>
				))}
				<Button
					variant='subtle'
					size='sm'
					leftSection={<IconPlus size={14} />}
					disabled={disabled}
					onClick={addItem}
					style={{ alignSelf: 'flex-start' }}
				>
					{translate('nikki.inventory.attribute.enumValueForm.addValue')}
				</Button>
			</Stack>
		</BaseFieldWrapper>
	);
}

type AttributeCreateFormContentProps = {
	isLoading: boolean;
	onSubmit: (data: any) => void | Promise<void>;
	handleSubmit: (
		onValid: (data: any) => void | Promise<void>,
	) => (e?: React.BaseSyntheticEvent) => Promise<void>;
};

function AttributeCreateFormContent({
	isLoading,
	onSubmit,
	handleSubmit,
}: AttributeCreateFormContentProps): React.ReactElement {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const dataType = useWatch({ control, name: 'dataType' }) as string | undefined;
	const isEnum = useWatch({ control, name: 'isEnum' }) as boolean | undefined;

	const [enumValues, setEnumValues] = React.useState<string[]>([]);
	const [enumValueError, setEnumValueError] = React.useState<string | undefined>();

	const showIsEnum = dataType === 'text' || dataType === 'number';
	const showEnumValue = showIsEnum && Boolean(isEnum);

	const handleFormSubmit = async (data: any) => {
		if (showEnumValue) {
			const filled = enumValues.map((v) => v.trim()).filter((v) => v !== '');
			if (dataType === 'number') {
				const parsed = filled.map(Number);
				if (parsed.some(isNaN)) {
					setEnumValueError(translate('nikki.inventory.attribute.enumValueForm.errors.invalidNumbers'));
					return;
				}
				await onSubmit({ ...data, enumValue: parsed });
			} else {
				await onSubmit({ ...data, enumValue: filled.map((v) => StringToJson(v)) });
			}
			setEnumValueError(undefined);
		} else {
			await onSubmit(data);
		}
	};

	return (
		<Paper>
			<form id='attribute-create-form' onSubmit={handleSubmit(handleFormSubmit)} noValidate autoComplete='off'>
				<Stack gap='lg'>
					<FormContainer>
						<Stack gap='sm'>
							<AutoField name='displayName' autoFocused inputProps={{ disabled: isLoading }} />
							<AutoField name='codeName' inputProps={{ disabled: isLoading }} />
							<AutoField name='dataType' inputProps={{ disabled: isLoading }} />
							<AutoField name='isRequired' inputProps={{ disabled: isLoading }} />
							{showIsEnum && <AutoField name='isEnum' inputProps={{ disabled: isLoading }} />}
							{showEnumValue && (
								<EnumValueField
									dataType={dataType}
									value={enumValues}
									onChange={setEnumValues}
									error={enumValueError}
									disabled={isLoading}
								/>
							)}
							<AutoField name='sortIndex' inputProps={{ disabled: isLoading }} />
						</Stack>
					</FormContainer>
				</Stack>
			</form>
		</Paper>
	);
}

export function AttributeCreateForm({
	isLoading,
	onSubmit,
}: AttributeCreateFormProps): React.ReactElement {
	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={ATTRIBUTE_CREATE_SCHEMA}
				modelLoading={isLoading}
			>
				{({ handleSubmit: formHandleSubmit }) => (
					<AttributeCreateFormContent
						isLoading={isLoading}
						onSubmit={onSubmit}
						handleSubmit={formHandleSubmit}
					/>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}