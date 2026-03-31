import { ModelSchema } from '@nikkierp/ui/model';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel';
import { Game } from '@/features/games/types';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';
import kioskSettingSchema from '@/features/kiosks/kioskSetting-schema.json';
import { Kiosk } from '@/features/kiosks/types';
import { Slideshow } from '@/features/slideshow/types';
import { Theme } from '@/features/themes/types';

import type { UIMode } from '../../../types';



export interface KioskSettingFormData {
	uiMode?: UIMode;
	waitingPlaylistId?: string;
	shoppingPlaylistId?: string;
	themeId?: string;
	gameId?: string;
}

/** Map từ `Kiosk` → defaultValues / reset cho FormFieldProvider. */
export function kioskToSettingFormValues(kiosk: Kiosk): KioskSettingFormData {
	return {
		uiMode: kiosk.uiMode,
		waitingPlaylistId: kiosk.waitingPlaylist?.id,
		shoppingPlaylistId: kiosk.shoppingPlaylist?.id,
		themeId: kiosk.theme?.id,
		gameId: kiosk.game?.id,
	};
}


export type KioskSettingPickerValues = {
	waitingPlaylist?: Slideshow;
	shoppingPlaylist?: Slideshow;
	theme?: Theme;
	game?: Game;
};

export function buildKioskSettingActions(
	isEditing: boolean,
	isSubmitting: boolean,
	translate: ReturnType<typeof useTranslation>['t'],
	handleEdit: () => void,
	handleSaveClick: () => void,
	handleCancel: () => void,
): ControlPanelProps['actions'] {
	return [
		...(!isEditing ? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}] : [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSaveClick,
			type: 'button' as const,
			variant: 'filled' as const,
			disabled: isSubmitting,
			loading: isSubmitting,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting,
		}]),
	];
}

export type UseKioskSettingTabReturn = {
	isEditing: boolean;
	setIsEditing: (v: boolean) => void;
	isSubmitting: boolean;
	setIsSubmitting: (v: boolean) => void;
	onFormSubmit: (data: KioskSettingFormData) => void | Promise<void>;
	modelSchema: ModelSchema;
	formValues: ReturnType<typeof kioskToSettingFormValues>;
};

export function useKioskSettingTab(kiosk: Kiosk): UseKioskSettingTabReturn {
	const [isEditing, setIsEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const modelSchema = kioskSettingSchema as ModelSchema;

	const formValues = useMemo(
		() => kioskToSettingFormValues(kiosk),
		[kiosk.id, kiosk.etag],
	);

	const onFormSubmit = useCallback(async (data: KioskSettingFormData) => {
		// TODO: gọi API cập nhật cài đặt kiosk
		void data;
		setIsEditing(false);
	}, []);

	return {
		isEditing,
		setIsEditing,
		isSubmitting,
		setIsSubmitting,
		onFormSubmit,
		modelSchema,
		formValues,
	};
}

export type UseKioskSettingTabFormArgs = {
	isEditing: boolean;
	setIsEditing: (v: boolean) => void;
	isSubmitting: boolean;
	setIsSubmitting: (v: boolean) => void;
	onFormSubmit: (data: KioskSettingFormData) => void | Promise<void>;
	form: UseFormReturn<KioskSettingFormData>;
	formValues: KioskSettingFormData;
	initialKioskSettings: KioskSettingPickerValues;
};

export type UseKioskSettingTabFormReturn = {
	waitingPlaylist: Slideshow | undefined;
	shoppingPlaylist: Slideshow | undefined;
	theme: Theme | undefined;
	game: Game | undefined;
	handleWaitingChange: (next: Slideshow | undefined) => void;
	handleShoppingChange: (next: Slideshow | undefined) => void;
	handleThemeChange: (next: Theme | undefined) => void;
	handleGameChange: (next: Game | undefined) => void;
};


// eslint-disable-next-line max-lines-per-function
export function useKioskSettingTabForm({
	isEditing,
	setIsEditing,
	isSubmitting,
	setIsSubmitting,
	onFormSubmit,
	form,
	formValues,
	initialKioskSettings,
}: UseKioskSettingTabFormArgs): UseKioskSettingTabFormReturn {
	const initialValues = useRef<KioskSettingPickerValues>({});
	const [kioskSettings, setKioskSettings] = useState<KioskSettingPickerValues>({
		waitingPlaylist: initialKioskSettings.waitingPlaylist,
		shoppingPlaylist: initialKioskSettings.shoppingPlaylist,
		theme: initialKioskSettings.theme,
		game: initialKioskSettings.game,
	});

	const wasEditingRef = useRef(false);

	useEffect(() => {
		if (isEditing && !wasEditingRef.current) {
			initialValues.current = { ...kioskSettings };
		}
		wasEditingRef.current = isEditing;
	}, [isEditing, initialValues]);

	const resetKioskSettings = useCallback((initialValues: KioskSettingPickerValues) => {
		setKioskSettings(initialValues);
	}, []);

	const onKioskSettingsSubmit = useCallback(
		async (data: KioskSettingFormData) => {
			setIsSubmitting(true);
			try {
				await onFormSubmit(data);
			}
			finally {
				setIsSubmitting(false);
			}
		},
		[onFormSubmit, setIsSubmitting],
	);

	const handleEdit = useCallback(() => {
		setIsEditing(true);
	}, [setIsEditing]);

	const handleSubmit = useCallback(() => {
		void form.handleSubmit(onKioskSettingsSubmit)();
	}, [form, onKioskSettingsSubmit]);

	const handleCancel = useCallback(() => {
		form.reset(formValues);
		resetKioskSettings({ ...initialValues.current });
		setIsEditing(false);
	}, [form, formValues, resetKioskSettings, setIsEditing]);

	const {t: translate} = useTranslation();
	const actions = useMemo(
		() => buildKioskSettingActions(
			isEditing,
			isSubmitting,
			translate,
			handleEdit,
			handleSubmit,
			handleCancel,
		),
		[isEditing, isSubmitting, handleEdit, handleSubmit, handleCancel],
	);

	useRegisterKioskDetailTab('kioskSetting', actions);

	return {
		waitingPlaylist: kioskSettings.waitingPlaylist,
		shoppingPlaylist: kioskSettings.shoppingPlaylist,
		theme: kioskSettings.theme,
		game: kioskSettings.game,
		handleWaitingChange: (next: Slideshow | undefined) => {
			setKioskSettings((prev) => ({ ...prev, waitingPlaylist: next }));
		},
		handleShoppingChange: (next: Slideshow | undefined) => {
			setKioskSettings((prev) => ({ ...prev, shoppingPlaylist: next }));
		},
		handleThemeChange: (next: Theme | undefined) => {
			setKioskSettings((prev) => ({ ...prev, theme: next }));
		},
		handleGameChange: (next: Game | undefined) => {
			setKioskSettings((prev) => ({ ...prev, game: next }));
		},
	};
}
