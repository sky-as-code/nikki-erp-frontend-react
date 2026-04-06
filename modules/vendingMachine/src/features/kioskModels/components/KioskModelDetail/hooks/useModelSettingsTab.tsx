import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskModelDetailTab } from '@/features/kioskModels/components/KioskModelDetail/kioskModelDetailTabControl';
import { KioskModel } from '@/features/kioskModels/types';


export type UseModelSettingsTabArgs = {
	model: KioskModel;
};

export type UseModelSettingsTabReturn = {
	isEditing: boolean;
};

export function useModelSettingsTab({ model }: UseModelSettingsTabArgs): UseModelSettingsTabReturn {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		// TODO: Implement save logic for model settings
		setIsEditing(false);
	}, []);
	const handleCancel = useCallback(() => setIsEditing(false), []);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		...(!isEditing ? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}] : [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSave,
			type: 'button' as const,
			variant: 'filled' as const,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			type: 'button' as const,
			variant: 'outline' as const,
		}]),
	], [isEditing, handleEdit, handleSave, handleCancel, translate]);

	useRegisterKioskModelDetailTab('modelSettings', actions);

	return { isEditing };
}
