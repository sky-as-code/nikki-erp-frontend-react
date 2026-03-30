/* eslint-disable max-lines-per-function */
import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';

import { Game } from '@/features/games/types';
import { kioskToSettingFormValues, pickEntityById, type KioskSettingFormData } from '@/features/kiosks/kioskSettingForm';
import { Kiosk } from '@/features/kiosks/types';
import { Slideshow } from '@/features/slideshow/types';
import { Theme } from '@/features/themes/types';

import { GameSelect } from './GameSelect';
import { InterfaceModeSelect } from './InterfaceModeSelect';
import { SlideshowSelect } from './SlideshowSelect';
import { ThemeSelect } from './ThemeSelect';

import type { KioskSettingTabState } from './hooks/types';


interface KioskSettingProps {
	kiosk: Kiosk;
	tabState: KioskSettingTabState;
}

type PickerDraft = {
	waitingSlideshow?: Slideshow;
	shoppingSlideshow?: Slideshow;
	theme?: Theme;
	game?: Game;
};

type KioskSettingInnerProps = {
	isEditing: boolean;
	formId: string;
	onFormSubmit: (data: KioskSettingFormData) => void | Promise<void>;
	reset: UseFormReturn<KioskSettingFormData>['reset'];
	form: UseFormReturn<KioskSettingFormData>;
	modelValue: KioskSettingFormData;
	registerResetForm: (fn: () => void) => void;
	kiosk: Kiosk;
};

const KioskSettingInner: React.FC<KioskSettingInnerProps> = ({
	isEditing,
	formId,
	onFormSubmit,
	reset,
	form,
	modelValue,
	registerResetForm,
	kiosk,
}) => {
	const [pickerDraft, setPickerDraft] = useState<PickerDraft>({});
	const draftSnapshotRef = useRef<PickerDraft>({});
	const wasEditingRef = useRef(false);

	const waitingPlaylistId = form.watch('waitingPlaylistId');
	const shoppingPlaylistId = form.watch('shoppingPlaylistId');
	const themeId = form.watch('themeId');
	const gameId = form.watch('gameId');

	const waitingSlideshowValue = useMemo(
		() => pickEntityById(waitingPlaylistId, kiosk.waitingPlaylist, pickerDraft.waitingSlideshow),
		[waitingPlaylistId, kiosk.waitingPlaylist, pickerDraft.waitingSlideshow],
	);

	const shoppingSlideshowValue = useMemo(
		() => pickEntityById(shoppingPlaylistId, kiosk.shoppingPlaylist, pickerDraft.shoppingSlideshow),
		[shoppingPlaylistId, kiosk.shoppingPlaylist, pickerDraft.shoppingSlideshow],
	);

	const themeValue = useMemo(
		() => pickEntityById(themeId, kiosk.theme, pickerDraft.theme),
		[themeId, kiosk.theme, pickerDraft.theme],
	);

	const gameValue = useMemo(
		() => pickEntityById(gameId, kiosk.game, pickerDraft.game),
		[gameId, kiosk.game, pickerDraft.game],
	);

	useEffect(() => {
		if (isEditing && !wasEditingRef.current) {
			draftSnapshotRef.current = { ...pickerDraft };
		}
		wasEditingRef.current = isEditing;
	}, [isEditing, pickerDraft]);

	const applyPickerDraft = useCallback((draft: PickerDraft) => {
		setPickerDraft(draft);
	}, []);

	useEffect(() => {
		registerResetForm(() => {
			reset(modelValue);
			applyPickerDraft({ ...draftSnapshotRef.current });
		});
	}, [registerResetForm, reset, modelValue, applyPickerDraft]);

	return (
		<Stack gap='md'>
			{isEditing && (
				<form
					id={formId}
					onSubmit={form.handleSubmit(onFormSubmit)}
					noValidate
					style={{ display: 'contents' }}
				/>
			)}

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
				value={waitingSlideshowValue}
				onChange={(next) => {
					form.setValue('waitingPlaylistId', next?.id);
					setPickerDraft((d) => ({ ...d, waitingSlideshow: next }));
				}}
				isEditing={isEditing}
			/>

			<SlideshowSelect
				type='shopping'
				value={shoppingSlideshowValue}
				onChange={(next) => {
					form.setValue('shoppingPlaylistId', next?.id);
					setPickerDraft((d) => ({ ...d, shoppingSlideshow: next }));
				}}
				isEditing={isEditing}
			/>

			<ThemeSelect
				value={themeValue}
				onChange={(next) => {
					form.setValue('themeId', next?.id);
					setPickerDraft((d) => ({ ...d, theme: next }));
				}}
				isEditing={isEditing}
			/>

			<GameSelect
				value={gameValue}
				onChange={(next) => {
					form.setValue('gameId', next?.id);
					setPickerDraft((d) => ({ ...d, game: next }));
				}}
				isEditing={isEditing}
			/>
		</Stack>
	);
};

export const KioskSetting: React.FC<KioskSettingProps> = ({ kiosk, tabState }) => {
	const {
		isEditing,
		formId,
		modelSchema,
		isSubmitting,
		onFormSubmit,
		registerResetForm,
	} = tabState;

	const modelValue = useMemo(
		() => kioskToSettingFormValues(kiosk),
		[kiosk.id, kiosk.etag],
	);

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				key={`${kiosk.id}-${kiosk.etag}-kiosk-setting`}
				formVariant='update'
				modelSchema={modelSchema}
				modelValue={modelValue}
				modelLoading={isEditing && isSubmitting}
			>
				{({ reset, form }) => (
					<KioskSettingInner
						isEditing={isEditing}
						formId={formId}
						onFormSubmit={(data) => onFormSubmit(data as KioskSettingFormData)}
						reset={reset}
						form={form}
						modelValue={modelValue}
						registerResetForm={registerResetForm}
						kiosk={kiosk}
					/>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
};
