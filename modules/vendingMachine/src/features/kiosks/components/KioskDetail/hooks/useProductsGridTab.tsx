import { IconDeviceFloppy, IconEdit, IconFileDownloadFilled, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';


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
	onResetGrid: () => void;
};

export type UseProductsGridTabReturn = {
	isEditing: boolean;
	/** `true` khi React đang render lại grid ở background sau khi toggle edit mode. */
	isPending: boolean;
	handleEdit: () => void;
	handleSave: () => void;
	handleCancel: () => void;
	handleDiscardChanges: () => void;
	handleLoadAll: () => void;
};

export function useProductsGridTab({ onResetGrid }: UseProductsGridTabArgs): UseProductsGridTabReturn {
	const [isEditing, setIsEditing] = useState(false);
	const [isPending, startTransition] = useTransition();
	const { t: translate } = useTranslation();

	const handleEdit = useCallback(() => {
		startTransition(() => setIsEditing(true));
	}, [startTransition]);

	const handleSave = useCallback(() => {
		// TODO: Implement save logic
		startTransition(() => setIsEditing(false));
	}, [startTransition]);

	const handleCancel = useCallback(() => {
		startTransition(() => setIsEditing(false));
	}, [startTransition]);

	const handleDiscardChanges = useCallback(() => {
		onResetGrid();
		startTransition(() => setIsEditing(false));
	}, [onResetGrid, startTransition]);

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
		isPending,
		handleEdit,
		handleSave,
		handleCancel,
		handleDiscardChanges,
		handleLoadAll,
	};
}

