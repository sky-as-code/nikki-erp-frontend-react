import { TextInput } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Org } from '@/features/orgs';


export const OrgDisplayField: React.FC<{ orgs?: Org[] }> = ({ orgs }) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('orgId');
	const inputId = useId();

	const orgId = useWatch({
		control,
		name: 'orgId',
	}) as string | undefined;

	const displayValue = React.useMemo(() => {
		if (!orgId) {
			return translate('nikki.authorize.role_suite.fields.org_all');
		}
		const org = orgs?.find((o) => o.id === orgId);
		return org ? org.displayName : orgId;
	}, [orgId, orgs, translate]);

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

