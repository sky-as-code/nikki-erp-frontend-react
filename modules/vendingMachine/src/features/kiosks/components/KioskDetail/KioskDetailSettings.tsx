import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';

import { GameSelect } from '@/components/GameSelect';
import { SlideshowSelect } from '@/components/SlideshowSelect';
import { ThemeSelect } from '@/components/ThemeSelect';
import { UIModeSelect } from '@/components/UIModeSelect';
import { Kiosk, UIMode } from '@/features/kiosks/types';

import { KioskSettingPickerValues, useKioskSettingTab, useKioskSettingTabForm } from './hooks';
import { type KioskSettingFormData } from './hooks/useKioskSettingTab';


interface KioskDetailSettingsProps {
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
				name='uiMode'
				render={({ field }) => (
					<UIModeSelect
						value={field.value as UIMode}
						onChange={(value) => field.onChange(value as UIMode)}
						isEditing={isEditing}
					/>
				)}
			/>

			<SlideshowSelect
				type='waiting'
				value={waitingPlaylist}
				onChange={handleWaitingChange}
				onRemove={() => handleWaitingChange(undefined)}
				isEditing={isEditing}
			/>

			<SlideshowSelect
				type='shopping'
				value={shoppingPlaylist}
				onChange={handleShoppingChange}
				onRemove={() => handleShoppingChange(undefined)}
				isEditing={isEditing}
			/>

			<ThemeSelect
				value={theme}
				onChange={handleThemeChange}
				onRemove={() => handleThemeChange(undefined)}
				isEditing={isEditing}
			/>

			<GameSelect
				value={game}
				onChange={handleGameChange}
				onRemove={() => handleGameChange(undefined)}
				isEditing={isEditing}
			/>
		</Stack>
	);
};

export const KioskDetailSettings: React.FC<KioskDetailSettingsProps> = ({ kiosk }) => {
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
