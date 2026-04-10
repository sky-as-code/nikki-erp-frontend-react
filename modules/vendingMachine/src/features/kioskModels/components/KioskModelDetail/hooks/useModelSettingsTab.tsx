import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskModelDetailTab } from '@/features/kioskModels/components/KioskModelDetail/kioskModelDetailTabControl';
import { buildShelvesConfigWire, parseShelvesConfigRows } from '@/features/kioskModels/components/ShelvesConfig';
import { useKioskModelEdit } from '@/features/kioskModels/hooks/useKioskModelEdit';
import { KioskModel, KioskType, ShelvesConfigRow } from '@/features/kioskModels/types';


export type UseModelSettingsTabArgs = {
	model: KioskModel;
};

export type UseModelSettingsTabReturn = {
	isEditing: boolean;
	isSubmitting: boolean;
	selectedKioskType: KioskType | undefined;
	setSelectedKioskType: (v: KioskType | undefined) => void;
	shelvesNumber: number;
	setShelvesNumber: (n: number) => void;
	shelvesConfigRows: ShelvesConfigRow[];
	setShelvesConfigRows: (rows: ShelvesConfigRow[]) => void;
};

export function useModelSettingsTab({ model }: UseModelSettingsTabArgs): UseModelSettingsTabReturn {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [selectedKioskType, setSelectedKioskType] = useState<KioskType | undefined>(model.kioskType);
	const [shelvesNumber, setShelvesNumber] = useState(model.shelvesNumber || 0);
	const [shelvesConfigRows, setShelvesConfigRows] = useState<ShelvesConfigRow[]>(
		() => parseShelvesConfigRows(model.shelvesConfig),
	);

	const syncFromModel = useCallback(() => {
		setSelectedKioskType(model.kioskType);
		setShelvesNumber(model.shelvesNumber || 0);
		setShelvesConfigRows(parseShelvesConfigRows(model.shelvesConfig));
	}, [model.kioskType, model.shelvesNumber, model.shelvesConfig]);

	const onUpdateSuccess = useCallback(() => setIsEditing(false), []);
	const { isSubmitting, handleSubmit } = useKioskModelEdit(model, { onUpdateSuccess });

	const handleEdit = useCallback(() => setIsEditing(true), []);

	const handleSave = useCallback(() => {
		handleSubmit({
			kioskType: selectedKioskType,
			shelvesNumber,
			shelvesConfig: buildShelvesConfigWire(shelvesConfigRows),
		});
	}, [handleSubmit, selectedKioskType, shelvesNumber, shelvesConfigRows]);

	const handleCancel = useCallback(() => {
		syncFromModel();
		setIsEditing(false);
	}, [syncFromModel]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		...(!isEditing
			? [{
				label: translate('nikki.general.actions.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: handleEdit,
				type: 'button' as const,
				variant: 'filled' as const,
			}]
			: [{
				label: translate('nikki.general.actions.save'),
				leftSection: <IconDeviceFloppy size={16} />,
				onClick: handleSave,
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
	], [isEditing, isSubmitting, translate, handleEdit, handleSave, handleCancel]);

	useRegisterKioskModelDetailTab('modelSettings', actions);

	return {
		isEditing,
		isSubmitting,
		selectedKioskType,
		setSelectedKioskType,
		shelvesNumber,
		setShelvesNumber,
		shelvesConfigRows,
		setShelvesConfigRows,
	};
}
