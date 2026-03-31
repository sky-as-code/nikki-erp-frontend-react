import { ModelSchema } from '@nikkierp/ui/model';
import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';
import {
	formDataToKioskUpdatePayload,
	KioskCreateFormData,
	kioskToCreateFormValues,
} from '@/features/kiosks/hooks/useKioskCreate';
import { useKioskDelete } from '@/features/kiosks/hooks/useKioskDelete';
import { useKioskEdit } from '@/features/kiosks/hooks/useKioskEdit';
import kioskCreateSchema from '@/features/kiosks/kioskCreate-schema.json';
import { Kiosk } from '@/features/kiosks/types';



export const BASIC_INFO_FORM_ID = 'kiosk-basic-info-form';

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
	kiosk: Kiosk;
	onOpenDeleteKiosk?: (kiosk: Kiosk) => void;
};

export type UseBasicInfoTabReturn = {
	formId: string;
	isEditing: boolean;
	isSubmitting: boolean;
	modelSchema: ModelSchema;
	modelValue: ReturnType<typeof kioskToCreateFormValues>;
	onFormSubmit: (data: KioskCreateFormData) => void;
	openDeleteModal: () => void;
	closeDeleteModal: () => void;
	confirmDelete: () => void;
	isOpenDeleteModal: boolean;
};

export function useBasicInfoTab({ kiosk }: UseBasicInfoTabArgs): UseBasicInfoTabReturn {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const { isSubmitting, handleSubmit } = useKioskEdit(kiosk, {
		onUpdateSuccess: () => setIsEditing(false),
	});

	const modelSchema = kioskCreateSchema as ModelSchema;

	const onFormSubmit = useCallback((data: KioskCreateFormData) => {
		handleSubmit(formDataToKioskUpdatePayload(data));
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(BASIC_INFO_FORM_ID);
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

	const { isOpenDeleteModal, openDeleteModal, closeDeleteModal, handleDelete } = useKioskDelete();

	const onDeleteClick = useCallback(() => openDeleteModal(kiosk), [kiosk, openDeleteModal]);

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

	useRegisterKioskDetailTab('basicInfo', actions);

	const modelValue = useMemo(
		() => kioskToCreateFormValues(kiosk),
		[kiosk.id, kiosk.etag],
	);

	return {
		formId: BASIC_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		modelValue,
		onFormSubmit,
		openDeleteModal: () => openDeleteModal(kiosk),
		closeDeleteModal,
		confirmDelete: handleDelete,
		isOpenDeleteModal,
	};
}
