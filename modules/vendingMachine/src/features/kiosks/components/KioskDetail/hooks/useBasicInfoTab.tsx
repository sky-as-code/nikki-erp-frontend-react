import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';
import { useKioskDelete } from '@/features/kiosks/hooks/useKioskDelete';
import { KioskUpdateFormData, useKioskEdit } from '@/features/kiosks/hooks/useKioskEdit';
import { kioskCreateSchema } from '@/features/kiosks/schemas';
import { Kiosk } from '@/features/kiosks/types';


export type KioskBasicInfoFormData = Pick<
	KioskUpdateFormData,
	| 'id'
	| 'etag'
	| 'code'
	| 'name'
	| 'status'
	| 'mode'
	| 'uiMode'
	| 'locationAddress'
	| 'latitude'
	| 'longitude'
	| 'modelRef'
	| 'paymentRefs'
>;

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
	formValues: KioskBasicInfoFormData;
	onFormSubmit: (data: KioskBasicInfoFormData) => void;
	openDeleteModal: () => void;
	closeDeleteModal: () => void;
	confirmDelete: () => void;
	isOpenDeleteModal: boolean;
};

export function useBasicInfoTab({ kiosk }: UseBasicInfoTabArgs): UseBasicInfoTabReturn {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const { isSubmitting, handleSubmit } = useKioskEdit({
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (kiosk.id) {
				dispatch(kioskActions.getKiosk(kiosk.id));
			}
		},
	});

	const modelSchema = kioskCreateSchema as ModelSchema;

	const onFormSubmit = useCallback((data: KioskBasicInfoFormData) => {
		handleSubmit(data);
	}, [handleSubmit, kiosk]);

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

	return {
		formId: BASIC_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		formValues: kiosk,
		onFormSubmit,
		openDeleteModal: () => openDeleteModal(kiosk),
		closeDeleteModal,
		confirmDelete: handleDelete,
		isOpenDeleteModal,
	};
}
