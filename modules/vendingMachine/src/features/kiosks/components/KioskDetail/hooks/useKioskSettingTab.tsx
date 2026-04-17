import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VendingMachineDispatch } from '@/appState';
import { kioskActions } from '@/appState/kiosk';
import { ControlPanelProps } from '@/components/ControlPanel';
import { Game } from '@/features/games/types';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';
import { KioskUpdateFormData, useKioskEdit } from '@/features/kiosks/hooks';
import { Kiosk, UIMode } from '@/features/kiosks/types';
import { Slideshow } from '@/features/mediaPlaylist/types';
import { Theme } from '@/features/themes/types';


export type KioskSettingFormData = Pick<
	KioskUpdateFormData,
	| 'id'
	| 'etag'
	| 'waitingScreenPlaylistRef'
	| 'shoppingScreenPlaylistRef'
	| 'themeRef'
	| 'gameRef'
	| 'uiMode'
>;

export type KioskSettingPickerValues = Pick<
	Kiosk,
	| 'uiMode'
	| 'waitingScreenPlaylist'
	| 'shoppingScreenPlaylist'
	| 'theme'
	| 'game'
>;

function pickerFromKiosk(k: Kiosk): KioskSettingPickerValues {
	return {
		uiMode: k.uiMode,
		waitingScreenPlaylist: k.waitingScreenPlaylist,
		shoppingScreenPlaylist: k.shoppingScreenPlaylist,
		theme: k.theme,
		game: k.game,
	};
}

function buildSubmitPayload(
	kiosk: Kiosk,
	settings: KioskSettingPickerValues,
): KioskSettingFormData {
	return {
		id: kiosk.id,
		etag: kiosk.etag,
		waitingScreenPlaylistRef: settings.waitingScreenPlaylist?.id,
		shoppingScreenPlaylistRef: settings.shoppingScreenPlaylist?.id,
		themeRef: settings.theme?.id,
		gameRef: settings.game?.id,
		uiMode: settings.uiMode,
	};
}

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
	isSubmitting: boolean;
	isEditing: boolean;
	setIsEditing: (v: boolean) => void;
	waitingScreenPlaylist: Slideshow | null | undefined;
	shoppingScreenPlaylist: Slideshow | null | undefined;
	theme: Theme | null | undefined;
	game: Game | null | undefined;
	uiMode: UIMode | null | undefined;
	handleWaitingChange: (next: Slideshow | undefined) => void;
	handleShoppingChange: (next: Slideshow | undefined) => void;
	handleThemeChange: (next: Theme | undefined) => void;
	handleGameChange: (next: Game | undefined) => void;
	handleUIModeChange: (next: UIMode | undefined) => void;
};


export function useKioskSettingTab(kiosk: Kiosk): UseKioskSettingTabReturn {
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const [isEditing, setIsEditing] = useState(false);
	const [kioskSettings, setKioskSettings] = useState<KioskSettingPickerValues>(pickerFromKiosk(kiosk));

	const { isSubmitting, handleSubmit } = useKioskEdit({
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (kiosk.id) {
				dispatch(kioskActions.getKiosk(kiosk.id));
			}
		},
	});

	const handleEdit = useCallback(() => {
		setIsEditing(true);
	}, []);

	const handleSaveClick = useCallback(() => {
		handleSubmit(buildSubmitPayload(kiosk, kioskSettings));
	}, [handleSubmit, kiosk, kioskSettings]);

	const handleCancel = useCallback(() => {
		setKioskSettings(pickerFromKiosk(kiosk));
		setIsEditing(false);
	}, [kiosk, setKioskSettings]);

	const actions = useMemo(
		() => buildKioskSettingActions(
			isEditing,
			isSubmitting,
			translate,
			handleEdit,
			handleSaveClick,
			handleCancel,
		),
		[isEditing, isSubmitting, translate, handleEdit, handleSaveClick, handleCancel],
	);

	useRegisterKioskDetailTab('kioskSetting', actions);

	const handleUIModeChange = useCallback((next?: UIMode | null) => {
		setKioskSettings((prev) => ({ ...prev, uiMode: next }));
	}, []);

	const handleWaitingChange = useCallback((next: Slideshow | undefined) => {
		setKioskSettings((prev) => ({ ...prev, waitingScreenPlaylist: next }));
	}, []);

	const handleShoppingChange = useCallback((next: Slideshow | undefined) => {
		setKioskSettings((prev) => ({ ...prev, shoppingScreenPlaylist: next }));
	}, []);

	const handleThemeChange = useCallback((next: Theme | undefined) => {
		setKioskSettings((prev) => ({ ...prev, theme: next }));
	}, []);

	const handleGameChange = useCallback((next: Game | undefined) => {
		setKioskSettings((prev) => ({ ...prev, game: next }));
	}, []);

	return {
		isSubmitting,
		isEditing,
		setIsEditing,
		waitingScreenPlaylist: kioskSettings?.waitingScreenPlaylist,
		shoppingScreenPlaylist: kioskSettings?.shoppingScreenPlaylist,
		theme: kioskSettings?.theme,
		game: kioskSettings?.game,
		uiMode: kioskSettings?.uiMode,
		handleWaitingChange,
		handleShoppingChange,
		handleThemeChange,
		handleGameChange,
		handleUIModeChange,
	};
}
