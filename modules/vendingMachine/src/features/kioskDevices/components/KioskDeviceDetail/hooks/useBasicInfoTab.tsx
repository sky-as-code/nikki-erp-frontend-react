import { ModelSchema } from '@nikkierp/ui/model';
import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskDeviceDetailTab } from '@/features/kioskDevices/components/KioskDeviceDetail/kioskDeviceDetailTabControl';
import {
	KioskDeviceCreateFormData,
	kioskDeviceToCreateFormValues,
	formDataToKioskDeviceUpdatePayload,
} from '@/features/kioskDevices/hooks/useKioskDeviceCreate';
import { useKioskDeviceDelete } from '@/features/kioskDevices/hooks/useKioskDeviceDelete';
import { useKioskDeviceEdit } from '@/features/kioskDevices/hooks/useKioskDeviceEdit';
import kioskDeviceCreateSchema from '@/features/kioskDevices/kioskDeviceCreate-schema.json';
import { KioskDevice } from '@/features/kioskDevices/types';


export const BASIC_INFO_FORM_ID = 'kiosk-device-basic-info-form';

function buildBasicInfoActions(
	isEditing: boolean,
	isSubmitting: boolean,
	translate: ReturnType<typeof useTranslation>['t'],
	handleEdit: () => void,
	handleSave: () => void,
	handleCancel: () => void,
	handleDelete: () => void,
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
		{
			label: translate('nikki.general.actions.delete'),
			leftSection: <IconTrash size={16} />,
			onClick: handleDelete,
			type: 'button' as const,
			variant: 'outline' as const,
			color: 'red' as const,
			disabled: isSubmitting,
		},
	];
}

export type UseBasicInfoTabArgs = {
	kioskDevice: KioskDevice;
};

export type UseBasicInfoTabReturn = {
	formId: string;
	isEditing: boolean;
	isSubmitting: boolean;
	modelSchema: ModelSchema;
	modelValue: ReturnType<typeof kioskDeviceToCreateFormValues>;
	onFormSubmit: (data: KioskDeviceCreateFormData) => void;
	closeDeleteModal: () => void;
	confirmDelete: () => void;
	isOpenDeleteModal: boolean;
};

export function useBasicInfoTab({ kioskDevice }: UseBasicInfoTabArgs): UseBasicInfoTabReturn {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const onUpdateSuccess = useCallback(() => setIsEditing(false), []);
	const { isSubmitting, handleSubmit } = useKioskDeviceEdit(kioskDevice, { onUpdateSuccess });

	const modelSchema = kioskDeviceCreateSchema as ModelSchema;

	const onFormSubmit = useCallback((data: KioskDeviceCreateFormData) => {
		handleSubmit(formDataToKioskDeviceUpdatePayload(data));
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(BASIC_INFO_FORM_ID);
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const onEditClick = useCallback(() => setIsEditing(true), []);
	const onCancelClick = useCallback(() => setIsEditing(false), []);

	const {
		handleDelete: dispatchDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
	} = useKioskDeviceDelete();

	const onDeleteClick = useCallback(
		() => handleOpenDeleteModal(kioskDevice),
		[kioskDevice, handleOpenDeleteModal],
	);

	const confirmDelete = useCallback(() => {
		dispatchDelete(kioskDevice.id);
		handleCloseDeleteModal();
	}, [dispatchDelete, kioskDevice.id, handleCloseDeleteModal]);

	const actions = useMemo(
		() => buildBasicInfoActions(
			isEditing,
			isSubmitting,
			translate,
			onEditClick,
			onSaveClick,
			onCancelClick,
			onDeleteClick,
		),
		[isEditing, isSubmitting, translate, onEditClick, onSaveClick, onCancelClick, onDeleteClick],
	);

	useRegisterKioskDeviceDetailTab('basicInfo', actions);

	const modelValue = useMemo(
		() => kioskDeviceToCreateFormValues(kioskDevice),
		[kioskDevice.id, kioskDevice.etag],
	);

	return {
		formId: BASIC_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		modelValue,
		onFormSubmit,
		closeDeleteModal: handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
	};
}
