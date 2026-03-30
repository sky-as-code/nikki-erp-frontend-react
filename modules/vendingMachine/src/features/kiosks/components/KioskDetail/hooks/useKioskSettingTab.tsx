import { ModelSchema } from '@nikkierp/ui/model';
import { IconDeviceFloppy, IconEdit, IconX } from '@tabler/icons-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import kioskSettingSchema from '@/features/kiosks/kioskSetting-schema.json';
import { Kiosk } from '@/features/kiosks/types';

import type { KioskSettingTabState, TabHookReturn } from './types';
import type { KioskSettingFormData } from '@/features/kiosks/kioskSettingForm';


const KIOSK_SETTING_FORM_ID = 'kiosk-setting-form';

function buildKioskSettingActions(
	isEditing: boolean,
	isSubmitting: boolean,
	translate: ReturnType<typeof useTranslation>['t'],
	handleEdit: () => void,
	handleSaveClick: () => void,
	handleCancel: () => void,
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
	];
}

/**
 * Tab Cài đặt: FormFieldProvider + kioskSettingSchema; Save/Cancel giống BasicInfo.
 */
export const useKioskSettingTab = (_kiosk?: Kiosk): TabHookReturn<KioskSettingTabState> => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const resetFormRef = useRef<(() => void) | null>(null);

	const modelSchema = kioskSettingSchema as ModelSchema;

	const onFormSubmit = useCallback(async (data: KioskSettingFormData) => {
		setIsSubmitting(true);
		try {
			// TODO: gọi API cập nhật cài đặt kiosk
			void data;
			setIsEditing(false);
		}
		finally {
			setIsSubmitting(false);
		}
	}, []);

	const handleSaveClick = useCallback(() => {
		const el = document.getElementById(KIOSK_SETTING_FORM_ID);
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const handleEdit = useCallback(() => {
		setIsEditing(true);
	}, []);

	const handleCancel = useCallback(() => {
		resetFormRef.current?.();
		setIsEditing(false);
	}, []);

	const registerResetForm = useCallback((fn: () => void) => {
		resetFormRef.current = fn;
	}, []);

	const actions = useMemo(
		() => buildKioskSettingActions(
			isEditing,
			isSubmitting,
			translate,
			handleEdit,
			handleSaveClick,
			handleCancel,
		),
		[isEditing, isSubmitting, translate, handleEdit, handleSaveClick, handleCancel],
	);

	return {
		actions,
		handlers: {
			handleEdit,
			handleSaveClick,
			handleCancel,
			onFormSubmit,
		},
		state: {
			isEditing,
			formId: KIOSK_SETTING_FORM_ID,
			modelSchema,
			isSubmitting,
			onFormSubmit,
			registerResetForm,
		},
	};
};
