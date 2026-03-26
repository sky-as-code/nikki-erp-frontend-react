import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { Kiosk } from '@/features/kiosks';

import type { TabHookReturn } from './types';

/**
 * Hook quản lý BasicInfo tab
 * Quản lý state isEditing riêng và trả về actions, handlers, state
 */
export const useBasicInfoTab = (_kiosk?: Kiosk): TabHookReturn<{ isEditing: boolean }> => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		// TODO: Implement save logic
		setIsEditing(false);
	}, []);
	const handleCancel = useCallback(() => setIsEditing(false), []);
	const handleDelete = useCallback(() => {
		// TODO: Implement delete logic
	}, []);

	const actions = useMemo<ControlPanelProps['actions']>(() => {
		return [
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
			{
				label: translate('nikki.general.actions.delete'),
				leftSection: <IconTrash size={16} />,
				onClick: handleDelete,
				variant: 'outline' as const,
				color: 'red' as const,
			},
		];
	}, [isEditing, handleEdit, handleSave, handleCancel, handleDelete, translate]);

	return {
		actions,
		handlers: { handleEdit, handleSave, handleCancel, handleDelete },
		state: { isEditing },
	};
};
