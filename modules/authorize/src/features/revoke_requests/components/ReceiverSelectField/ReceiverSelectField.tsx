import { Select } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useFormField, useFieldData } from '@nikkierp/ui/components/form';
import { BaseFieldWrapper } from '@nikkierp/ui/components/form';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Group } from '@/features/identities';
import type { User } from '@/features/identities';


interface ReceiverSelectFieldProps {
	users?: User[];
	groups?: Group[];
}

export const ReceiverSelectField: React.FC<ReceiverSelectFieldProps> = ({ users, groups }) => {
	const { t: translate } = useTranslation();
	const { control } = useFormField();
	const fieldData = useFieldData('receiverId');
	const inputId = useId();

	const receiverType = useWatch({
		control,
		name: 'receiverType',
	}) as 'user' | 'group' | undefined;

	const options = React.useMemo(() => {
		if (receiverType === 'user' && users) {
			return users.map((u) => ({ value: u.id, label: u.displayName }));
		}
		if (receiverType === 'group' && groups) {
			return groups.map((g) => ({ value: g.id, label: g.name }));
		}
		return [];
	}, [receiverType, users, groups]);

	if (!fieldData) {
		return null;
	}

	const shouldDisable = !receiverType || options.length === 0;

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			description={translate(fieldData.description ?? '')}
			isRequired={fieldData.isRequired}
			error={translate(fieldData.error ?? '')}
		>
			<Controller
				name='receiverId'
				control={control}
				rules={{ required: fieldData.isRequired }}
				render={({ field }) => (
					<Select
						id={inputId}
						placeholder={
							!receiverType
								? translate('nikki.authorize.grant_request.placeholders.select_receiver_type_first')
								: options.length === 0
									? translate('nikki.authorize.grant_request.placeholders.no_receivers_available')
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

