import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VendingMachineDispatch, kioskSettingActions } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { Kiosk } from '@/features/kiosks/types';

import { KioskSetting } from '../../../types';
import { useRegisterKioskSettingDetailTab } from '../kioskSettingDetailTabControl';


type UseKioskSettingKiosksTabArgs = {
	setting: KioskSetting;
};

export function useKioskSettingKiosksTab({ setting }: UseKioskSettingKiosksTabArgs) {
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const [isEditing, setIsEditing] = useState(false);
	const [draftKiosks, setDraftKiosks] = useState<Kiosk[]>([]);
	const [kioskSelectModalOpened, setKioskSelectModalOpened] = useState(false);

	const resetDraftFromSetting = useCallback(() => {
		setDraftKiosks(setting.kiosks ?? []);
	}, [setting]);

	useEffect(() => {
		resetDraftFromSetting();
	}, [setting.id, setting.etag, resetDraftFromSetting]);

	const handleEdit = useCallback(() => setIsEditing(true), []);

	const handleSave = useCallback(async () => {
		if (!setting.id || !setting.etag) return;
		dispatch(kioskSettingActions.updateKioskSetting({
			id: setting.id,
			etag: setting.etag,
			updates: { kiosks: draftKiosks },
		}));
		setIsEditing(false);
	}, [dispatch, setting, draftKiosks]);

	const handleCancel = useCallback(() => {
		resetDraftFromSetting();
		setIsEditing(false);
	}, [resetDraftFromSetting]);

	const handleRemoveKiosk = useCallback((kioskId: string) => {
		setDraftKiosks((prev) => prev.filter((k) => k.id !== kioskId));
	}, []);

	const handleAddKiosksFromModal = useCallback((kiosks: Kiosk[]) => {
		setDraftKiosks((prev) => [...prev, ...kiosks]);
	}, []);

	const handleOpenAddKiosks = useCallback(() => {
		setKioskSelectModalOpened(true);
	}, []);

	const handleCloseAddKiosks = useCallback(() => {
		setKioskSelectModalOpened(false);
	}, []);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		...(!isEditing ? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			variant: 'filled' as const,
		}] : [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSave,
			variant: 'filled' as const,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			variant: 'outline' as const,
		}]),
	], [isEditing, handleEdit, handleSave, handleCancel, translate]);

	useRegisterKioskSettingDetailTab('kiosks', actions);

	return {
		kiosks: draftKiosks,
		kioskSelectModalOpened,
		onAddKiosks: handleOpenAddKiosks,
		onCloseKioskSelectModal: handleCloseAddKiosks,
		onRemoveKiosk: handleRemoveKiosk,
		onSelectKiosks: handleAddKiosksFromModal,
		isEditing,
	};
}
