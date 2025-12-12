import { Select } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Org } from '@/features/orgs/types';

import { ALL_ORGS_VALUE } from '@/features/role_suites/validation/roleSuiteFormValidation';


interface OrgSelectFieldProps {
	orgs?: Org[];
	onOrgIdChange?: (orgId: string | undefined) => void;
}

export const OrgSelectField: React.FC<OrgSelectFieldProps> = ({ orgs, onOrgIdChange }) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('orgId');
	const inputId = useId();

	const options = React.useMemo(
		() => ([
			{
				value: ALL_ORGS_VALUE,
				label: translate('nikki.authorize.role_suite.fields.org_all'),
			},
			...(orgs ?? []).map((o) => ({ value: o.id, label: o.displayName })),
		]),
		[orgs, translate],
	);

	const handleChange = React.useCallback((val: string | null, fieldOnChange: (v: unknown) => void) => {
		// Convert ALL_ORGS_VALUE or null to undefined (domain level)
		const newOrgId = (val === null || val === ALL_ORGS_VALUE) ? undefined : val;
		fieldOnChange(newOrgId);
		onOrgIdChange?.(newOrgId);
	}, [onOrgIdChange]);

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
			<Controller
				name='orgId'
				control={control}
				rules={{ required: fieldData.isRequired }}
				render={({ field }) => (
					<Select
						id={inputId}
						placeholder={translate(fieldData.placeholder || '')}
						data={options}
						value={field.value || ALL_ORGS_VALUE}
						onChange={(val) => handleChange(val, field.onChange)}
						searchable
						clearable={false}
						required={fieldData.isRequired}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
};