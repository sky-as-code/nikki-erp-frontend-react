/* eslint-disable max-lines-per-function */


import { Box, Combobox, Flex, MultiSelect, TextInput, useCombobox } from '@mantine/core';
import { useId } from '@mantine/hooks';
import {
	AutoField,
	BaseFieldWrapper,
	useFormField,
	useFieldData,
} from '@nikkierp/ui/components';
import { IconMapPin } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { buildSimpleSearchGraph } from '@/components';
import { useKioskModelList } from '@/features/kioskModels';
import { KioskModel } from '@/features/kioskModels/types';
import { usePaymentList } from '@/features/payment';
import { PaymentMethod } from '@/features/payment/types';

import classes from './KioskFormFields.module.css';
import { Kiosk } from '../../types';


export type KioskFormFieldsMode = 'view' | 'create' | 'edit';

export interface KioskFormFieldsProps {
	mode: KioskFormFieldsMode;
	kiosk?: Kiosk;
	isSubmitting?: boolean;
}

export const KioskFormFields: React.FC<KioskFormFieldsProps> = ({ mode, kiosk, isSubmitting }) => {
	const isView = mode === 'view';
	const readonlyInput = isView ? { readOnly: true } : {};

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
				<SearchableKioskModelSelect
					readOnly={isView}
					disabled={isSubmitting ?? false}
					defaultValue={kiosk?.model ?? null} />
			</Box>
			<Box className={classes.kioskFormField}>
				<PaymentMethodsField readOnly={isView} disabled={isSubmitting ?? false} />
			</Box>
		</>
	);
};


const findItem = (items: any[], targetId: string) => {
	return items.find((item) => item.id === targetId) ?? null;
};
function SearchableKioskModelSelect({ readOnly, disabled, defaultValue }:
{ readOnly: boolean, disabled: boolean, defaultValue?: KioskModel | null }) {
	const inputId = useId();
	const { control } = useFormField();
	const fieldData = useFieldData('modelRef');
	const { t: translate } = useTranslation();

	const [searchValue, setSearchValue] = useState('');
	const [currentItem, setCurrentItem] = useState<KioskModel | null>(defaultValue ?? null);

	const graph = useMemo(() => buildSimpleSearchGraph([
		{
			key: 'search',
			type: 'search',
			value: searchValue,
			searchFields: ['name', 'modelId', 'referenceCode'],
		},
	]), [searchValue, disabled]);

	const { models } = useKioskModelList(graph);

	if (!fieldData) {
		return null;
	}
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});
	const options = models.map((item: any) => (
		<Combobox.Option value={item.id} key={item.id} selected={item.id === currentItem?.id}>
			{item.name}
		</Combobox.Option>
	));

	return (
		<BaseFieldWrapper
			inputId={inputId}
			label={translate(fieldData.label)}
			description={translate(fieldData.description ?? '')}
			isRequired={fieldData.isRequired}
			error={translate(fieldData.error ?? '')}
		>
			<Controller
				name='modelRef'
				control={control}
				defaultValue={null}
				render={({ field }) => (
					<Combobox
						store={combobox}
						onClose={() => {
							setSearchValue('');
						}}
						onOpen={() => {
							setSearchValue('');
						}}
						onOptionSubmit={(optionValue) => {
							field.onChange(optionValue);
							setSearchValue('');
							const selectedItem = findItem(models, optionValue);
							setCurrentItem(selectedItem);
							combobox.closeDropdown();
						}}
					>
						<Combobox.Target>
							<TextInput
								size='md'
								placeholder={combobox.dropdownOpened ? (currentItem?.name || '') : 'Pick value or type anything'}
								value={combobox.dropdownOpened ? searchValue : (currentItem?.name || '')}
								onChange={(event) => {
									setSearchValue(event.currentTarget.value);
								}}
								readOnly={readOnly}
								disabled={disabled}
								onClick={() => !readOnly && !disabled && combobox.openDropdown()}
								onFocus={() => !readOnly && !disabled && combobox.openDropdown()}
								onBlur={() => !readOnly && !disabled && combobox.closeDropdown()}
							/>
						</Combobox.Target>

						<Combobox.Dropdown>
							<Combobox.Options>
								{options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}
							</Combobox.Options>
						</Combobox.Dropdown>
					</Combobox>
				)}
			/>
		</BaseFieldWrapper>
	);
}

function PaymentMethodsField({ readOnly, disabled }: { readOnly: boolean, disabled: boolean }) {
	const inputId = useId();
	const { control } = useFormField();
	const fieldData = useFieldData('paymentRefs');
	const { t: translate } = useTranslation();

	const [searchValue, setSearchValue] = useState('');

	const graph = useMemo(() => buildSimpleSearchGraph([
		{
			key: 'search',
			type: 'search',
			value: searchValue,
			searchFields: ['name', 'method'],
		},
	]), [searchValue, disabled]);

	const { payments, isLoadingList } = usePaymentList(graph);
	const paymentOptions = React.useMemo(
		() => (isLoadingList ? [] : (payments ?? []).map((p: PaymentMethod) => ({ value: p.id, label: p.name }))),
		[payments, isLoadingList],
	);

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
						size='md'
						searchable={!disabled}
						clearable={!disabled}
						id={inputId}
						data={paymentOptions}
						value={field.value ?? []}
						onChange={field.onChange}
						searchValue={searchValue}
						onSearchChange={setSearchValue}
						placeholder={translate('nikki.vendingMachine.kiosk.fields.paymentMethods')}
						readOnly={readOnly}
						disabled={disabled}
					/>
				)}
			/>
		</BaseFieldWrapper>
	);
}
