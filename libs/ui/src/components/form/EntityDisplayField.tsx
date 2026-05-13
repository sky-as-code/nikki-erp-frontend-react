import { TextInput } from '@mantine/core';
import { useId } from '@mantine/hooks';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { BaseFieldWrapper } from './fields';
import { useFormField, useFieldData } from './formContext';
import { useLocalize, useTranslate } from '../../i18n';


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
	const localize = useLocalize('common');
	const translate = useTranslate('common');
	const { control } = useFormField();
	const fieldData = useFieldData(fieldName);
	const inputId = useId();

	const fieldValue = useWatch({
		control,
		name: fieldName,
	}) as string | undefined;

	const displayValue = React.useMemo(() => {
		if (!fieldValue) {
			return fallbackValue || (translate(fallbackLabelKey!));
		}
		const entity = entities?.find((e) => getEntityId(e) === fieldValue);
		return entity ? getEntityName(entity) : fieldValue;
	}, [fieldValue, entities, getEntityId, getEntityName, fallbackLabelKey, fallbackValue, localize]);

	if (!fieldData) {
		return null;
	}

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={localize(fieldData.label)}
			description={localize(fieldData.description as any)}
			isRequired={fieldData.isRequired}
			error={localize(fieldData.error as any)}
		>
			<TextInput
				id={inputId}
				value={displayValue}
				readOnly
			/>
		</BaseFieldWrapper>
	);
}

