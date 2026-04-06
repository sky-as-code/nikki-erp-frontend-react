import { ModelSchema } from '@nikkierp/ui/model';
import {
	IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX,
} from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem } from '@/components/ControlPanel';
import {
	SettingCreateFormData,
	settingToCreateFormValues,
	formDataToSettingUpdatePayload,
} from '@/features/settings/hooks/useSettingCreate';
import { useSettingDelete } from '@/features/settings/hooks/useSettingDelete';
import { useSettingEdit } from '@/features/settings/hooks/useSettingEdit';
import settingCreateSchema from '@/features/settings/settingCreate-schema.json';

import { useSettingDetailBreadcrumbs } from './useSettingDetailBreadcrumbs';

import type {
	UseSettingDetailPageConfigProps,
	UseSettingDetailPageConfigReturn,
} from './types';


export const SETTING_BASIC_INFO_FORM_ID = 'setting-basic-info-form';

function useSettingDetailActions(
	isEditing: boolean,
	isSubmitting: boolean,
	onEditClick: () => void,
	onSaveClick: () => void,
	onCancelClick: () => void,
	onDeleteClick: () => void,
): ControlPanelActionItem[] {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();

	return useMemo<ControlPanelActionItem[]>(() => {
		const backAction: ControlPanelActionItem = {
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../settings'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		};

		const editActions: ControlPanelActionItem[] = !isEditing
			? [{
				label: translate('nikki.general.actions.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: onEditClick,
				type: 'button',
				variant: 'filled',
			}]
			: [{
				label: translate('nikki.general.actions.save'),
				leftSection: <IconDeviceFloppy size={16} />,
				onClick: onSaveClick,
				type: 'button',
				variant: 'filled',
				disabled: isSubmitting,
				loading: isSubmitting,
			}, {
				label: translate('nikki.general.actions.cancel'),
				leftSection: <IconX size={16} />,
				onClick: onCancelClick,
				type: 'button',
				variant: 'outline',
				disabled: isSubmitting,
			}];

		const deleteAction: ControlPanelActionItem = {
			label: translate('nikki.general.actions.delete'),
			leftSection: <IconTrash size={16} />,
			onClick: onDeleteClick,
			type: 'button',
			variant: 'outline',
			color: 'red',
			disabled: isSubmitting,
		};

		return [backAction, ...editActions, deleteAction];
	}, [translate, navigate, isEditing, isSubmitting,
		onEditClick, onSaveClick, onCancelClick, onDeleteClick]);
}

export function useSettingDetailPageConfig(
	{ setting }: UseSettingDetailPageConfigProps,
): UseSettingDetailPageConfigReturn {
	const breadcrumbs = useSettingDetailBreadcrumbs({ setting });
	const [isEditing, setIsEditing] = useState(false);

	const onUpdateSuccess = useCallback(() => setIsEditing(false), []);
	const { isSubmitting, handleSubmit } = useSettingEdit(setting, {
		onUpdateSuccess,
	});

	const onFormSubmit = useCallback((data: SettingCreateFormData) => {
		handleSubmit(formDataToSettingUpdatePayload(data));
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(SETTING_BASIC_INFO_FORM_ID);
		if (el instanceof HTMLFormElement) el.requestSubmit();
	}, []);

	const onEditClick = useCallback(() => setIsEditing(true), []);
	const onCancelClick = useCallback(() => setIsEditing(false), []);

	const {
		handleDelete: dispatchDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
	} = useSettingDelete();

	const onDeleteClick = useCallback(
		() => { if (setting) handleOpenDeleteModal(setting); },
		[setting, handleOpenDeleteModal],
	);

	const confirmDelete = useCallback(() => {
		if (setting) dispatchDelete(setting.id);
		handleCloseDeleteModal();
	}, [dispatchDelete, setting?.id, handleCloseDeleteModal]);

	const actions = useSettingDetailActions(
		isEditing, isSubmitting,
		onEditClick, onSaveClick, onCancelClick, onDeleteClick,
	);

	const modelSchema = settingCreateSchema as ModelSchema;

	const modelValue = useMemo(
		() => setting ? settingToCreateFormValues(setting) : undefined,
		[setting?.id, setting?.etag],
	);

	return useMemo(() => ({
		breadcrumbs,
		actions,
		formProps: {
			formId: SETTING_BASIC_INFO_FORM_ID,
			isEditing,
			isSubmitting,
			modelSchema,
			modelValue,
			onFormSubmit,
			closeDeleteModal: handleCloseDeleteModal,
			confirmDelete,
			isOpenDeleteModal,
		},
	}), [breadcrumbs, actions, isEditing, isSubmitting,
		modelSchema, modelValue, onFormSubmit,
		handleCloseDeleteModal, confirmDelete, isOpenDeleteModal]);
}
