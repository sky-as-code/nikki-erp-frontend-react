import { MultiSelect } from '@mantine/core';
import { useId } from '@mantine/hooks';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
	AutoField,
	EntitySelectField,
	BaseFieldWrapper,
	useFormField,
	useFieldData,
} from '@nikkierp/ui/components';
import { useKioskModelList } from '@/features/kioskModels';
import { usePaymentList } from '@/features/payment';
import { KioskModel } from '@/features/kioskModels/types';
import { PaymentMethod } from '@/features/payment/types';


export interface KioskFormFieldsProps {
	isCreate: boolean;
}

export const KioskFormFields: React.FC<KioskFormFieldsProps> = ({ isCreate }) => {
	const { t: translate } = useTranslation();
	const { models } = useKioskModelList();
	const { payments } = usePaymentList();

	const modelOptions = React.useMemo(
		() => (models ?? []).map((m: KioskModel) => ({ value: m.id, label: m.name })),
		[models],
	);
	const paymentOptions = React.useMemo(
		() => (payments ?? []).map((p: PaymentMethod) => ({ value: p.id, label: p.name })),
		[payments],
	);

	return (
		<>
			<AutoField name='name' autoFocused />
			<AutoField name='code' />
			<AutoField name='address' />
			<AutoField name='latitude' />
			<AutoField name='longitude' />
			<AutoField name='status' />
			<AutoField name='mode' />
			{isCreate && (
				<>
					<EntitySelectField
						fieldName='modelId'
						entities={models ?? []}
						getEntityId={(m) => m.id}
						getEntityName={(m) => m.name}
						placeholder={translate('nikki.vendingMachine.kioskModels.fields.model')}
					/>
					<PaymentMethodsField data={paymentOptions} />
				</>
			)}
		</>
	);
};

interface PaymentMethodsFieldProps {
	data: Array<{ value: string; label: string }>;
}

function PaymentMethodsField({ data }: PaymentMethodsFieldProps) {
	const inputId = useId();
	const { control } = useFormField();
	const fieldData = useFieldData('paymentMethodIds');
	const { t: translate } = useTranslation();

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
				name='paymentMethodIds'
				control={control}
				defaultValue={[]}
				render={({ field }) => (
					<MultiSelect
						id={inputId}
						data={data}
						value={field.value ?? []}
						onChange={field.onChange}
						placeholder={translate('nikki.vendingMachine.kiosk.fields.paymentMethods')}
						searchable
						clearable
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}
