import { Select } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { RoleSuite } from '@/features/roleSuites';
import type { Role } from '@/features/roles';


interface TargetSelectFieldProps {
	roles?: Role[];
	roleSuites?: RoleSuite[];
}

export const TargetSelectField: React.FC<TargetSelectFieldProps> = ({ roles, roleSuites }) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('targetRef');
	const inputId = useId();

	const targetType = useWatch({
		control,
		name: 'targetType',
	}) as 'role' | 'suite' | undefined;

	const options = React.useMemo(() => {
		if (targetType === 'role' && roles) {
			return roles.map((r) => ({ value: r.id, label: r.name }));
		}
		if (targetType === 'suite' && roleSuites) {
			return roleSuites.map((rs) => ({ value: rs.id, label: rs.name }));
		}
		return [];
	}, [targetType, roles, roleSuites]);

	if (!fieldData) {
		return null;
	}

	const shouldDisable = !targetType || options.length === 0;

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			description={translate(fieldData.description ?? '')}
			isRequired={fieldData.isRequired}
			error={translate(fieldData.error ?? '')}
		>
			<Controller
				name='targetRef'
				control={control}
				rules={{ required: fieldData.isRequired }}
				render={({ field }) => (
					<Select
						id={inputId}
						placeholder={
							!targetType
								? translate('nikki.authorize.grant_request.placeholders.select_target_type_first')
								: options.length === 0
									? translate('nikki.authorize.grant_request.placeholders.no_targets_available')
									: translate(fieldData.placeholder || '')
						}
						data={options}
						value={shouldDisable ? null : (field.value || null)}
						onChange={(val) => {
							field.onChange(val === null ? undefined : val);
						}}
						searchable
						clearable
						required={fieldData.isRequired}
						disabled={shouldDisable}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
};

