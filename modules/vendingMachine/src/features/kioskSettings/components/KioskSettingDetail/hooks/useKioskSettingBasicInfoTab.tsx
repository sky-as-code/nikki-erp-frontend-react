import { ModelSchema } from '@nikkierp/ui/model';
import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import {
	formDataToKioskSettingBasicInfoUpdates,
	KioskSettingBasicInfoFormData,
	kioskSettingToFormModelValues,
	useKioskSettingEdit,
} from '@/features/kioskSettings/hooks/useKioskSettingEdit';
import { kioskSettingSchema } from '@/features/kioskSettings/schemas';

import { KioskSetting } from '../../../types';
import { useRegisterKioskSettingDetailTab } from '../kioskSettingDetailTabControl';
import { useKioskSettingDetailPersistence } from './useKioskSettingDetailPersistence';


export const KIOSK_SETTING_BASIC_INFO_FORM_ID = 'kiosk-setting-basic-info-form';

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

type UseKioskSettingBasicInfoTabArgs = {
	setting: KioskSetting;
};

export function useKioskSettingBasicInfoTab({ setting }: UseKioskSettingBasicInfoTabArgs) {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

	const { onDelete } = useKioskSettingDetailPersistence(setting);

	const { isSubmitting, handleSubmit } = useKioskSettingEdit(setting, {
		onUpdateSuccess: () => setIsEditing(false),
	});

	const modelSchema = kioskSettingSchema as ModelSchema;

	const onFormSubmit = useCallback((data: KioskSettingBasicInfoFormData) => {
		handleSubmit(formDataToKioskSettingBasicInfoUpdates(data));
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(KIOSK_SETTING_BASIC_INFO_FORM_ID);
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const onEditClick = useCallback(() => {
		setIsEditing(true);
	}, []);

	const onCancelClick = useCallback(() => {
		setIsEditing(false);
	}, []);

	const onDeleteClick = useCallback(() => setIsOpenDeleteModal(true), []);

	const closeDeleteModal = useCallback(() => setIsOpenDeleteModal(false), []);

	const confirmDelete = useCallback(async () => {
		await onDelete();
		closeDeleteModal();
	}, [onDelete, closeDeleteModal]);

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

	useRegisterKioskSettingDetailTab('basicInfo', actions);

	const modelValue = useMemo(
		() => kioskSettingToFormModelValues(setting),
		[setting.id, setting.etag, setting.code, setting.name, setting.description, setting.status, setting.brand, setting.createdAt],
	);

	return {
		formId: KIOSK_SETTING_BASIC_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		modelValue,
		onFormSubmit,
		closeDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
	};
}
