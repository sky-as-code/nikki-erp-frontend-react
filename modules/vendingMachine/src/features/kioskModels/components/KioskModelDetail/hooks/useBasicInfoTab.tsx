import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { kioskModelActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskModelDetailTab } from '@/features/kioskModels/components/KioskModelDetail/kioskModelDetailTabControl';
import { useKioskModelDelete } from '@/features/kioskModels/hooks/useKioskModelDelete';
import { KioskModelUpdateFormData, useKioskModelEdit } from '@/features/kioskModels/hooks/useKioskModelEdit';
import kioskModelCreateSchema from '@/features/kioskModels/kioskModelCreate-schema.json';
import { KioskModel } from '@/features/kioskModels/types';


export const BASIC_INFO_FORM_ID = 'kiosk-model-basic-info-form';

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
	model: KioskModel;
};

export type UseBasicInfoTabReturn = {
	formId: string;
	isEditing: boolean;
	isSubmitting: boolean;
	modelSchema: ModelSchema;
	onFormSubmit: (data: KioskModelUpdateFormData) => void;
	closeDeleteModal: () => void;
	confirmDelete: () => void;
	isOpenDeleteModal: boolean;
};

export function useBasicInfoTab({ model }: UseBasicInfoTabArgs): UseBasicInfoTabReturn {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const onUpdateSuccess = useCallback(() => {
		setIsEditing(false);
		if (model.id) {
			dispatch(kioskModelActions.getKioskModel(model.id));
		}
	}, [model.id, dispatch]);
	const { isSubmitting, handleSubmit } = useKioskModelEdit({ onUpdateSuccess });

	const modelSchema = kioskModelCreateSchema as ModelSchema;

	const onFormSubmit = useCallback((data: KioskModelUpdateFormData) => {
		handleSubmit(data);
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
		handleOpenDeleteModal, handleCloseDeleteModal, isOpenDeleteModal,
	} = useKioskModelDelete({ onDeleteSuccess: () => navigate('../kiosk-models') });

	const onDeleteClick = useCallback(
		() => handleOpenDeleteModal(model),
		[model, handleOpenDeleteModal],
	);

	const confirmDelete = useCallback(() => {
		dispatchDelete(model.id);
		handleCloseDeleteModal();
	}, [dispatchDelete, model.id, handleCloseDeleteModal]);

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

	useRegisterKioskModelDetailTab('basicInfo', actions);

	return {
		formId: BASIC_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		onFormSubmit,
		closeDeleteModal: handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
	};
}
