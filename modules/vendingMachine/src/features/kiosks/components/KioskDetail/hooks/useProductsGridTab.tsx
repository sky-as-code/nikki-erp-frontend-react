import { IconDeviceFloppy, IconEdit, IconFileDownloadFilled, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel';

import { useRegisterKioskDetailTab } from './KioskDetailTabControlContext';


export function buildProductsGridActions(
	isEditing: boolean,
	translate: ReturnType<typeof useTranslation>['t'],
	handleEdit: () => void,
	handleSave: () => void,
	handleCancel: () => void,
): ControlPanelProps['actions'] {
	return [
		...(!isEditing ? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			variant: 'filled' as const,
		}] :
			[
				{
					label: translate('nikki.vendingMachine.kiosk.products.actions.loadAll'),
					leftSection: <IconFileDownloadFilled size={16} />,
					onClick: handleSave,
					variant: 'filled' as const,
				},
				{
					label: translate('nikki.general.actions.save'),
					leftSection: <IconDeviceFloppy size={16} />,
					onClick: handleSave,
					variant: 'filled' as const,
				},
				{
					label: translate('nikki.general.actions.cancel'),
					leftSection: <IconX size={16} />,
					onClick: handleCancel,
					variant: 'outline' as const,
				},
			]),
	];
}

export type UseProductsGridTabArgs = {
	translate: ReturnType<typeof useTranslation>['t'];
	onResetGrid: () => void;
};

export type UseProductsGridTabReturn = {
	isEditing: boolean;
	handleEdit: () => void;
	handleSave: () => void;
	handleCancel: () => void;
	handleDiscardChanges: () => void;
	handleLoadAll: () => void;
};

export function useProductsGridTab({ translate, onResetGrid }: UseProductsGridTabArgs): UseProductsGridTabReturn {
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => {
		setIsEditing(true);
	}, []);

	const handleSave = useCallback(() => {
		// TODO: Implement save logic
		setIsEditing(false);
	}, []);

	const handleCancel = useCallback(() => {
		setIsEditing(false);
	}, []);

	const handleDiscardChanges = useCallback(() => {
		onResetGrid();
		setIsEditing(false);
	}, [onResetGrid]);

	const handleLoadAll = useCallback(() => {
		// TODO: Implement load all from API
	}, []);

	const actions = useMemo(
		() => buildProductsGridActions(isEditing, translate, handleEdit, handleSave, handleCancel),
		[isEditing, translate, handleEdit, handleSave, handleCancel],
	);

	useRegisterKioskDetailTab('productsGrid', actions);

	return {
		isEditing,
		handleEdit,
		handleSave,
		handleCancel,
		handleDiscardChanges,
		handleLoadAll,
	};
}

