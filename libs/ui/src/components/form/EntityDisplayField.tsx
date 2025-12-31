import { TextInput } from '@mantine/core';
import { useId } from '@mantine/hooks';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BaseFieldWrapper } from './fields';
import { useFormField, useFieldData } from './formContext';


export interface EntityDisplayFieldProps<TEntity> {
	fieldName: string;
	entities?: TEntity[];
	getEntityId: (entity: TEntity) => string;
	getEntityName: (entity: TEntity) => string;
	fallbackLabelKey?: string;
	fallbackValue?: string;
}

export function EntityDisplayField<TEntity>({
	fieldName,
	entities,
	getEntityId,
	getEntityName,
	fallbackLabelKey,
	fallbackValue,
}: EntityDisplayFieldProps<TEntity>) {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData(fieldName);
	const inputId = useId();

	const fieldValue = useWatch({
		control,
		name: fieldName,
	}) as string | undefined;

	const displayValue = React.useMemo(() => {
		if (!fieldValue) {
			return fallbackValue || (fallbackLabelKey ? translate(fallbackLabelKey) : '');
		}
		const entity = entities?.find((e) => getEntityId(e) === fieldValue);
		return entity ? getEntityName(entity) : fieldValue;
	}, [fieldValue, entities, getEntityId, getEntityName, fallbackLabelKey, fallbackValue, translate]);

	if (!fieldData) {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			description={translate(fieldData.description ?? '')}
			isRequired={fieldData.isRequired}
			error={translate(fieldData.error ?? '')}
		>
			<TextInput
				id={inputId}
				value={displayValue}
				readOnly
			/>
		</BaseFieldWrapper>
	);
}

