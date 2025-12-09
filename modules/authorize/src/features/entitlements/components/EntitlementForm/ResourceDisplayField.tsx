import { TextInput } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Resource } from '@/features/resources';


export const ResourceDisplayField: React.FC<{ resources?: Resource[] }> = ({ resources }) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('resourceId');
	const inputId = useId();

	const resourceId = useWatch({
		control,
		name: 'resourceId',
	}) as string | undefined;

	const displayValue = React.useMemo(() => {
		if (!resourceId) {
			return translate('nikki.authorize.entitlement.fields.resource_all');
		}
		const resource = resources?.find((r) => r.id === resourceId);
		return resource ? resource.name : resourceId;
	}, [resourceId, resources, translate]);

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

