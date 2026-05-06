import {
ActionIcon,
Button,
Group,
Stack,
Text,
TextInput,
} from '@mantine/core';
import { useId } from '@mantine/hooks';

import {
AutoField,
BaseFieldWrapper,
FormStyleProvider,
FormFieldProvider,
useFieldData,
useFormField,
} from '@nikkierp/ui/components/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import attributeSchema from '../../../schemas/attribute-schema.json';
import { JsonToString, StringToJson } from '../../../utils/serializer';

import type { ModelSchema } from '@nikkierp/ui/model';
import type { Attribute } from '../types';

const ATTRIBUTE_UPDATE_SCHEMA = attributeSchema as ModelSchema;
const UPDATE_FORM_FIELDS = ['displayName', 'codeName', 'dataType', 'isRequired', 'isEnum', 'sortIndex', 'enumValue'];

interface EnumValueFieldProps {
dataType: string | undefined;
value: string[];
onChange: (value: string[]) => void;
error?: string;
readOnly?: boolean;
}

function EnumValueField({ dataType, value, onChange, error, readOnly }: EnumValueFieldProps): React.ReactElement | null {
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
			<Text size='sm' c='dimmed'>{translate('nikki.inventory.attribute.enumValueForm.noValues')}{!readOnly && ' ' + translate('nikki.inventory.attribute.enumValueForm.noValuesHint')}</Text>
		)}
		{value.map((item, i) => (
			<Group key={i} gap='xs' wrap='nowrap'>
				<TextInput
					value={item}
					onChange={(e) => updateItem(i, e.currentTarget.value)}
					placeholder={placeholder}
					type={isNumber ? 'number' : 'text'}
					readOnly={readOnly}
					size='md'
					flex={1}
				/>
				{!readOnly && (
					<ActionIcon
						variant='subtle'
						color='red'
						size='lg'
						onClick={() => removeItem(i)}
						aria-label={translate('nikki.inventory.attribute.enumValueForm.removeValue')}
					>
						<IconTrash size={16} />
					</ActionIcon>
				)}
			</Group>
		))}
		{!readOnly && (
			<Button
				variant='subtle'
				size='sm'
				leftSection={<IconPlus size={14} />}
				onClick={addItem}
				style={{ alignSelf: 'flex-start' }}
			>
				{translate('nikki.inventory.attribute.enumValueForm.addValue')}
			</Button>
		)}
	</Stack>
</BaseFieldWrapper>
);
}

interface AttributeFormContentProps {
isEditing: boolean;
isLoading: boolean;
attributeDetail: Attribute | undefined;
onSubmit: (data: Record<string, unknown>) => void;
handleSubmit: (
onValid: (data: any) => void | Promise<void>,
) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

function AttributeFormContent({
isEditing,
isLoading,
attributeDetail,
onSubmit,
handleSubmit,
}: AttributeFormContentProps): React.ReactElement {
const { t: translate } = useTranslation();
const { control } = useFormField();
const dataType = useWatch({ control, name: 'dataType' }) as string | undefined;
const isEnum = useWatch({ control, name: 'isEnum' }) as boolean | undefined;

	const showIsEnum = dataType === 'text' || dataType === 'number';
const showEnumValue = showIsEnum && Boolean(isEnum);

	const [enumValues, setEnumValues] = React.useState<string[]>(() => {
	if (!attributeDetail?.enumValue) return [];
	return attributeDetail.enumValue.map((item) => {
		if (typeof item === 'number' || typeof item === 'string') return String(item);
		return JsonToString(item as Record<string, string>);
	});
});
const [enumValueError, setEnumValueError] = React.useState<string | undefined>();

React.useEffect(() => {
	if (!attributeDetail?.enumValue) { setEnumValues([]); return; }
	setEnumValues(attributeDetail.enumValue.map((item) => {
		if (typeof item === 'number' || typeof item === 'string') return String(item);
		return JsonToString(item as Record<string, string>);
	}));
}, [attributeDetail]);

React.useEffect(() => {
if (!showEnumValue) setEnumValueError(undefined);
}, [showEnumValue]);

const handleFormSubmit = async (data: Record<string, unknown>) => {
if (showEnumValue) {
	const filled = enumValues.map((v) => v.trim()).filter((v) => v !== '');
	if (dataType === 'number') {
		const parsed = filled.map(Number);
		if (parsed.some(isNaN)) { setEnumValueError(translate('nikki.inventory.attribute.enumValueForm.errors.invalidNumbers')); return; }
		onSubmit({ ...data, enumValue: parsed });
	} else {
		onSubmit({ ...data, enumValue: filled.map((v) => StringToJson(v)) });
	}
	setEnumValueError(undefined);
} else {
	onSubmit(data);
}
};

const isReadOnly = !isEditing || isLoading;

return (
<form id='attribute-detail-form' onSubmit={handleSubmit(handleFormSubmit)} noValidate autoComplete='off'>
<Stack gap='md'>
<AutoField name='displayName' autoFocused htmlProps={{ readOnly: isReadOnly }} />
<AutoField name='codeName' htmlProps={{ readOnly: isReadOnly }} />
<AutoField name='dataType' htmlProps={{ readOnly: isReadOnly }} />
<AutoField name='isRequired' htmlProps={{ readOnly: isReadOnly }} />
{showIsEnum && <AutoField name='isEnum' htmlProps={{ readOnly: isReadOnly }} />}
{showEnumValue && (
<EnumValueField
dataType={dataType}
value={enumValues}
onChange={setEnumValues}
error={enumValueError}
readOnly={isReadOnly}
/>
)}
<AutoField name='sortIndex' htmlProps={{ readOnly: isReadOnly }} />
</Stack>
</form>
);
}

export interface AttributeDetailFormProps {
attributeDetail: Attribute | undefined;
isLoading: boolean;
isEditing: boolean;
onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
}

export const AttributeDetailForm: React.FC<AttributeDetailFormProps> = ({
attributeDetail,
isLoading,
isEditing,
onSubmit,
}) => {

const modelValue = attributeDetail
? { ...attributeDetail, displayName: JsonToString(attributeDetail.displayName) }
: undefined;

const updateSchema = React.useMemo((): ModelSchema => ({
...ATTRIBUTE_UPDATE_SCHEMA,
fields: Object.fromEntries(
Object.entries(ATTRIBUTE_UPDATE_SCHEMA.fields).map(([key, field]) => [
key,
UPDATE_FORM_FIELDS.includes(key) ? field : { ...field, frontendOnly: true },
]),
),
}), []);

return (
<FormStyleProvider layout='onecol'>
<FormFieldProvider
formVariant='update'
modelSchema={updateSchema}
modelValue={modelValue}
modelLoading={isLoading}
>
{({ handleSubmit }) => (
<AttributeFormContent
isEditing={isEditing}
isLoading={isLoading}
attributeDetail={attributeDetail}
onSubmit={onSubmit}
handleSubmit={handleSubmit}
/>
)}
</FormFieldProvider>
</FormStyleProvider>
);
};

AttributeDetailForm.displayName = 'AttributeDetailForm';
