import { ModelSchema } from '@nikkierp/ui/model';
import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel';
import {
	formDataToKioskUpdatePayload,
	KioskCreateFormData,
} from '@/features/kiosks/hooks/useKioskCreate';
import { useKioskEdit } from '@/features/kiosks/hooks/useKioskEdit';
import kioskCreateSchema from '@/features/kiosks/kioskCreate-schema.json';
import { Kiosk } from '@/features/kiosks/types';

import type { BasicInfoTabState, TabHookReturn } from './types';


const BASIC_INFO_FORM_ID = 'kiosk-basic-info-form';

function buildBasicInfoActions(
	isEditing: boolean,
	isSubmitting: boolean,
	translate: ReturnType<typeof useTranslation>['t'],
	handleEdit: () => void,
	handleSaveClick: () => void,
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
			onClick: handleSaveClick,
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

/**
 * BasicInfo tab: FormFieldProvider + kioskCreateSchema giống KioskCreatePage; submit → update kiosk.
 */
export const useBasicInfoTab = (
	kiosk?: Kiosk,
	handleOpenDeleteModal?: (k: Kiosk) => void,
): TabHookReturn<BasicInfoTabState> => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const { isSubmitting, handleSubmit } = useKioskEdit(kiosk, {
		onUpdateSuccess: () => setIsEditing(false),
	});

	const modelSchema = kioskCreateSchema as ModelSchema;

	const onFormSubmit = useCallback((data: KioskCreateFormData) => {
		if (!kiosk) return;
		handleSubmit(formDataToKioskUpdatePayload(data));
	}, [kiosk, handleSubmit]);

	const handleSaveClick = useCallback(() => {
		const el = document.getElementById(BASIC_INFO_FORM_ID);
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const handleEdit = useCallback(() => {
		setIsEditing(true);
	}, []);

	const handleCancel = useCallback(() => {
		setIsEditing(false);
	}, []);

	const handleDelete = useCallback(() => {
		if (kiosk && handleOpenDeleteModal) {
			handleOpenDeleteModal(kiosk);
		}
	}, [kiosk, handleOpenDeleteModal]);

	const actions = useMemo(
		() => buildBasicInfoActions(
			isEditing,
			isSubmitting,
			translate,
			handleEdit,
			handleSaveClick,
			handleCancel,
			handleDelete,
		),
		[isEditing, isSubmitting, translate, handleEdit, handleSaveClick, handleCancel, handleDelete],
	);

	return {
		actions,
		handlers: { handleEdit, handleSaveClick, handleCancel, handleDelete, onFormSubmit },
		state: {
			isEditing,
			formId: BASIC_INFO_FORM_ID,
			modelSchema,
			isSubmitting,
			onFormSubmit,
		},
	};
};
