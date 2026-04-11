import { Box, Flex, MultiSelect } from '@mantine/core';
import { useId } from '@mantine/hooks';
import {
	AutoField,
	EntitySelectField,
	BaseFieldWrapper,
	useFormField,
	useFieldData,
} from '@nikkierp/ui/components';
import { IconMapPin } from '@tabler/icons-react';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import classes from './KioskFormFields.module.css';

import { useKioskModelList } from '@/features/kioskModels';
import { KioskModel } from '@/features/kioskModels/types';
import { usePaymentList } from '@/features/payment';
import { PaymentMethod } from '@/features/payment/types';



export type KioskFormFieldsMode = 'view' | 'create' | 'edit';

export interface KioskFormFieldsProps {
	mode: KioskFormFieldsMode;
}

export const KioskFormFields: React.FC<KioskFormFieldsProps> = ({ mode }) => {
	const { t: translate } = useTranslation();
	const { models } = useKioskModelList();
	const { payments } = usePaymentList();

	const isView = mode === 'view';
	const readonlyInput = isView ? { readOnly: true } : {};

	const paymentOptions = React.useMemo(
		() => (payments ?? []).map((p: PaymentMethod) => ({ value: p.id, label: p.name })),
		[payments],
	);

	return (
		<>
			<Box className={classes.kioskFormField}>
				<AutoField name='name' autoFocused={mode === 'create'} htmlProps={readonlyInput} />
			</Box>

			{mode === 'create' &&
				<Box className={classes.kioskFormField}>
					<AutoField name='code'/>
				</Box>
			}

			<Box className={classes.kioskFormField}>
				<AutoField
					inputProps={{
						leftSection: <IconMapPin color='black' size={18} style={{ marginBottom: 2 }} />,
					}}
					htmlProps={readonlyInput}
					name='locationAddress'
				/>
			</Box>

			<Flex w='100%' gap='md' align='flex-start' wrap='nowrap'>
				<Box flex={1} miw={0} className={classes.kioskFormField}>
					<AutoField name='latitude' inputProps={{ w: '100%' }} htmlProps={readonlyInput} />
				</Box>
				<Box flex={1} miw={0} className={classes.kioskFormField}>
					<AutoField name='longitude' inputProps={{ w: '100%' }} htmlProps={readonlyInput}/>
				</Box>
			</Flex>

			<Box className={classes.kioskFormField}>
				<AutoField name='status' htmlProps={readonlyInput}/>
			</Box>
			<Box className={classes.kioskFormField}>
				<AutoField name='mode' htmlProps={readonlyInput}/>
			</Box>
			<Box className={classes.kioskFormField}>
				<EntitySelectField
					fieldName='modelRef'
					entities={models ?? []}
					getEntityId={(m: KioskModel) => m.id}
					getEntityName={(m: KioskModel) => m.name}
					placeholder={translate('nikki.vendingMachine.kioskModels.fields.model')}
					selectProps={{ readOnly: isView }}
				/>
			</Box>
			<Box className={classes.kioskFormField}>
				<PaymentMethodsField data={paymentOptions} disabled={isView} />
			</Box>
		</>
	);
};

interface PaymentMethodsFieldProps {
	data: Array<{ value: string; label: string }>;
	disabled?: boolean;
}

function PaymentMethodsField({ data, disabled }: PaymentMethodsFieldProps) {
	const inputId = useId();
	const { control } = useFormField();
	const fieldData = useFieldData('paymentRefs');
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
				name='paymentRefs'
				control={control}
				defaultValue={[]}
				render={({ field }) => (
					<MultiSelect
						id={inputId}
						data={data}
						value={field.value ?? []}
						onChange={field.onChange}
						placeholder={translate('nikki.vendingMachine.kiosk.fields.paymentMethods')}
						readOnly={disabled}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}
