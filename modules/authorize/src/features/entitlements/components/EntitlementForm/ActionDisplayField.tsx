import { TextInput } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Action } from '../../../actions';


export const ActionDisplayField: React.FC<{ actions?: Action[] }> = ({ actions }) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('actionId');
	const inputId = useId();

	const actionId = useWatch({
		control,
		name: 'actionId',
	}) as string | undefined;

	const displayValue = React.useMemo(() => {
		if (!actionId) {
			return translate('nikki.authorize.entitlement.fields.action_all');
		}
		const action = actions?.find((a) => a.id === actionId);
		return action ? action.name : actionId;
	}, [actionId, actions, translate]);

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
				disabled
			/>
		</BaseFieldWrapper>
	);
};

