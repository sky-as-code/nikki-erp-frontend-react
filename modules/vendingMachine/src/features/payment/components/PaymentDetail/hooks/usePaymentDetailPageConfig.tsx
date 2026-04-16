/* eslint-disable max-lines-per-function */
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import {
	IconArchive,
	IconArrowLeft,
	IconDeviceFloppy,
	IconEdit,
	IconRestore,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { paymentActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { usePaymentArchived } from '@/features/payment/hooks/usePaymentArchived';
import { usePaymentDelete } from '@/features/payment/hooks/usePaymentDelete';
import { usePaymentEdit } from '@/features/payment/hooks/usePaymentEdit';
import { paymentSchema } from '@/features/payment/schemas';
import { PaymentMethod } from '@/features/payment/types';

import { usePaymentDetailBreadcrumbs } from './usePaymentDetailBreadcrumbs';

import type { UsePaymentDetailPageConfigReturn } from './types';



export const PAYMENT_DETAIL_FORM_ID = 'payment-detail-form';

function buildToolbarActions(
	isEditing: boolean,
	isSubmitting: boolean,
	payment: PaymentMethod,
	translate: ReturnType<typeof useTranslation>['t'],
	onEdit: () => void,
	onSave: () => void,
	onCancel: () => void,
	onDelete: () => void,
	onArchive: () => void,
	onRestore: () => void,
): ControlPanelProps['actions'] {
	const primary = !isEditing
		? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: onEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}]
		: [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: onSave,
			type: 'button' as const,
			variant: 'filled' as const,
			disabled: isSubmitting,
			loading: isSubmitting,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: onCancel,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting,
		}];

	const archiveAction = payment.isArchived
		? {
			label: translate('nikki.general.actions.restore'),
			leftSection: <IconRestore size={16} />,
			onClick: onRestore,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting || isEditing,
		}
		: {
			label: translate('nikki.general.actions.archive'),
			leftSection: <IconArchive size={16} />,
			onClick: onArchive,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting || isEditing,
			color: 'orange' as const,
		};

	return [
		...primary,
		archiveAction,
		{
			label: translate('nikki.general.actions.delete'),
			leftSection: <IconTrash size={16} />,
			onClick: onDelete,
			type: 'button' as const,
			variant: 'outline' as const,
			color: 'red' as const,
			disabled: isSubmitting || isEditing,
		},
	];
}

export const usePaymentDetailPageConfig = (
	{ payment }: { payment?: PaymentMethod },
): UsePaymentDetailPageConfigReturn => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const [isEditing, setIsEditing] = useState(false);
	const [formResetNonce, setFormResetNonce] = useState(0);

	const onUpdateSuccess = useCallback(() => {
		setIsEditing(false);
		if (payment?.id) {
			dispatch(paymentActions.getPayment(payment.id));
		}
	}, [payment?.id, dispatch]);

	const { isSubmitting, handleSubmit } = usePaymentEdit({ onUpdateSuccess });

	const onArchiveSuccess = useCallback(() => {
		if (payment?.id) {
			dispatch(paymentActions.getPayment(payment.id));
		}
	}, [payment?.id, dispatch]);

	const {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal: handleCloseArchiveModal,
		isOpenArchiveModal,
		pendingArchive,
	} = usePaymentArchived({ onArchiveSuccess });

	const {
		handleDelete: dispatchDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		paymentToDelete,
	} = usePaymentDelete({ onDeleteSuccess: () => navigate('../payment') });

	const onFormSubmit = useCallback((data: Parameters<typeof handleSubmit>[0]) => {
		handleSubmit(data);
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(PAYMENT_DETAIL_FORM_ID);
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const onEditClick = useCallback(() => setIsEditing(true), []);
	const onCancelClick = useCallback(() => {
		setFormResetNonce((n) => n + 1);
		setIsEditing(false);
	}, []);

	const onDeleteClick = useCallback(() => {
		if (payment) {
			handleOpenDeleteModal(payment);
		}
	}, [payment, handleOpenDeleteModal]);

	const confirmDelete = useCallback(() => {
		if (payment) {
			dispatchDelete(payment.id);
		}
		handleCloseDeleteModal();
	}, [dispatchDelete, payment, handleCloseDeleteModal]);

	const modelSchema = paymentSchema as ModelSchema;

	const onArchiveClick = useCallback(() => {
		if (payment) {
			handleOpenArchiveModal(payment);
		}
	}, [payment, handleOpenArchiveModal]);

	const onRestoreClick = useCallback(() => {
		if (payment) {
			handleOpenRestoreModal(payment);
		}
	}, [payment, handleOpenRestoreModal]);

	const panelActions = useMemo(() => {
		if (!payment) {
			return [];
		}
		return buildToolbarActions(
			isEditing,
			isSubmitting,
			payment,
			translate,
			onEditClick,
			onSaveClick,
			onCancelClick,
			onDeleteClick,
			onArchiveClick,
			onRestoreClick,
		);
	}, [
		payment, isEditing, isSubmitting, translate,
		onEditClick, onSaveClick, onCancelClick, onDeleteClick, onArchiveClick, onRestoreClick,
	]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../payment'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		},
		...(panelActions ?? []),
	], [translate, navigate, panelActions]);

	const breadcrumbs = usePaymentDetailBreadcrumbs({ payment });

	return useMemo(() => ({
		breadcrumbs,
		actions,
		formId: PAYMENT_DETAIL_FORM_ID,
		formResetNonce,
		isEditing,
		isSubmitting,
		onFormSubmit,
		closeDeleteModal: handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
		paymentForDelete: paymentToDelete,
		modelSchema,
	}), [
		breadcrumbs,
		actions,
		formResetNonce,
		isEditing,
		isSubmitting,
		onFormSubmit,
		handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
		paymentToDelete,
		modelSchema,
	]);
};
