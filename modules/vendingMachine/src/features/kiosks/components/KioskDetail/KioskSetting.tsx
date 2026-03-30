import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';

import { type KioskSettingFormData } from '@/features/kiosks/kioskSettingForm';
import { Kiosk } from '@/features/kiosks/types';

import { GameSelect } from './GameSelect';
import { KioskSettingPickerValues, useKioskSettingTab, useKioskSettingTabForm } from './hooks/useKioskSettingTab';
import { InterfaceModeSelect } from './InterfaceModeSelect';
import { SlideshowSelect } from './SlideshowSelect';
import { ThemeSelect } from './ThemeSelect';


interface KioskSettingProps {
	kiosk: Kiosk;
}

type KioskSettingFieldsProps = {
	kiosk: Kiosk;
	isEditing: boolean;
	setIsEditing: (v: boolean) => void;
	isSubmitting: boolean;
	setIsSubmitting: (v: boolean) => void;
	onFormSubmit: (data: KioskSettingFormData) => void | Promise<void>;
	form: UseFormReturn<KioskSettingFormData>;
	formValues: KioskSettingFormData;
	initialKioskSettings: KioskSettingPickerValues;
};

const KioskSettingFields: React.FC<KioskSettingFieldsProps> = ({
	form,
	formValues,
	initialKioskSettings,
	isEditing,
	setIsEditing,
	isSubmitting,
	setIsSubmitting,
	onFormSubmit,
}) => {
	const {
		waitingPlaylist,
		shoppingPlaylist,
		theme,
		game,
		handleWaitingChange,
		handleShoppingChange,
		handleThemeChange,
		handleGameChange,
	} = useKioskSettingTabForm({
		isEditing,
		setIsEditing,
		isSubmitting,
		setIsSubmitting,
		onFormSubmit,
		form,
		formValues,
		initialKioskSettings,
	});

	return (
		<Stack gap='md'>
			<Controller
				control={form.control}
				name='interfaceMode'
				render={({ field }) => (
					<InterfaceModeSelect
						value={field.value}
						onChange={field.onChange}
						isEditing={isEditing}
					/>
				)}
			/>

			<SlideshowSelect
				type='waiting'
				value={waitingPlaylist}
				onChange={handleWaitingChange}
				isEditing={isEditing}
			/>

			<SlideshowSelect
				type='shopping'
				value={shoppingPlaylist}
				onChange={handleShoppingChange}
				isEditing={isEditing}
			/>

			<ThemeSelect
				value={theme}
				onChange={handleThemeChange}
				isEditing={isEditing}
			/>

			<GameSelect
				value={game}
				onChange={handleGameChange}
				isEditing={isEditing}
			/>
		</Stack>
	);
};

export const KioskSetting: React.FC<KioskSettingProps> = ({ kiosk }) => {
	const {
		isEditing,
		setIsEditing,
		isSubmitting,
		setIsSubmitting,
		onFormSubmit,
		modelSchema,
		formValues,
	} = useKioskSettingTab(kiosk);

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				key={`${kiosk.id}-${kiosk.etag}-kiosk-setting`}
				formVariant='update'
				modelSchema={modelSchema}
				modelValue={formValues}
				modelLoading={isEditing && isSubmitting}
			>
				{({ form }) => (
					<KioskSettingFields
						kiosk={kiosk}
						isEditing={isEditing}
						setIsEditing={setIsEditing}
						isSubmitting={isSubmitting}
						setIsSubmitting={setIsSubmitting}
						onFormSubmit={onFormSubmit}
						form={form}
						formValues={formValues}
						initialKioskSettings={{
							waitingPlaylist: kiosk.waitingPlaylist,
							shoppingPlaylist: kiosk.shoppingPlaylist,
							theme: kiosk.theme,
							game: kiosk.game,
						}}
					/>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
};
