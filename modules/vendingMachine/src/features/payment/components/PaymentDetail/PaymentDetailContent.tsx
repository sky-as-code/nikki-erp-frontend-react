import React, { useCallback, useLayoutEffect, useState } from 'react';

import {
	paymentConfigToRows,
	type PaymentConfigRow,
} from '@/features/payment/utils/paymentConfigRows';

import { mergePaymentDetailFormData } from './mergePaymentDetailFormData';
import { PaymentDetailInner } from './PaymentDetailInner';
import { PaymentDetailModals } from './PaymentDetailModals';

import type { UsePaymentDetailPageConfigReturn } from './hooks/types';
import type { PaymentMethod } from '@/features/payment/types';


export type PaymentDetailContentProps = {
	payment: PaymentMethod;
} & Omit<UsePaymentDetailPageConfigReturn, 'breadcrumbs' | 'actions'>;

export const PaymentDetailContent: React.FC<PaymentDetailContentProps> = ({
	payment,
	formId,
	formResetNonce,
	isEditing,
	isSubmitting,
	modelSchema,
	onFormSubmit,
	closeDeleteModal,
	confirmDelete,
	isOpenDeleteModal,
	isOpenArchiveModal,
	pendingArchive,
	handleConfirmArchive,
	handleCloseArchiveModal,
}) => {
	const [configRows, setConfigRows] = useState<PaymentConfigRow[]>([]);

	useLayoutEffect(() => {
		if (isEditing) {
			setConfigRows(paymentConfigToRows(payment.config));
		}
	}, [isEditing, payment.id, payment.etag]);

	useLayoutEffect(() => {
		if (!isEditing) {
			setConfigRows(paymentConfigToRows(payment.config));
		}
	}, [isEditing, payment.id, payment.etag, payment.config, formResetNonce]);

	const handleMergedSubmit = useCallback(
		(data: Record<string, unknown>) => {
			onFormSubmit(mergePaymentDetailFormData(payment, data, configRows));
		},
		[onFormSubmit, configRows, payment],
	);

	return (
		<React.Fragment>
			<PaymentDetailInner
				payment={payment}
				formId={formId}
				formResetNonce={formResetNonce}
				isEditing={isEditing}
				isSubmitting={isSubmitting}
				modelSchema={modelSchema}
				handleMergedSubmit={handleMergedSubmit}
				configRows={configRows}
				onConfigRowsChange={setConfigRows}
			/>
			<PaymentDetailModals
				payment={payment}
				closeDeleteModal={closeDeleteModal}
				confirmDelete={confirmDelete}
				isOpenDeleteModal={isOpenDeleteModal}
				isOpenArchiveModal={isOpenArchiveModal}
				pendingArchive={pendingArchive}
				handleConfirmArchive={handleConfirmArchive}
				handleCloseArchiveModal={handleCloseArchiveModal}
			/>
		</React.Fragment>
	);
};
