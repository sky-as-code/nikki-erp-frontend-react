import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { UsePaymentDetailPageConfigReturn } from './hooks/types';
import type { PaymentMethod } from '@/features/payment/types';



type ModalProps = Pick<
	UsePaymentDetailPageConfigReturn,
	| 'closeDeleteModal'
	| 'confirmDelete'
	| 'isOpenDeleteModal'
	| 'isOpenArchiveModal'
	| 'pendingArchive'
	| 'handleConfirmArchive'
	| 'handleCloseArchiveModal'
> & { payment: PaymentMethod };

export const PaymentDetailModals: React.FC<ModalProps> = ({
	payment,
	closeDeleteModal,
	confirmDelete,
	isOpenDeleteModal,
	isOpenArchiveModal,
	pendingArchive,
	handleConfirmArchive,
	handleCloseArchiveModal,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<ConfirmModal
				title={t('nikki.general.messages.delete_confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={
					<Trans
						i18nKey='nikki.vendingMachine.payment.messages.delete_confirm'
						values={{ name: payment.name }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<ConfirmModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				title={pendingArchive?.targetArchived
					? t('nikki.vendingMachine.payment.messages.archive_modal_title')
					: t('nikki.vendingMachine.payment.messages.restore_modal_title')}
				message={
					<Trans
						i18nKey={pendingArchive?.targetArchived
							? 'nikki.vendingMachine.payment.messages.archive_confirm'
							: 'nikki.vendingMachine.payment.messages.restore_confirm'}
						values={{ name: pendingArchive?.payment?.name || '' }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={pendingArchive?.targetArchived
					? t('nikki.general.actions.archive')
					: t('nikki.general.actions.restore')}
				confirmColor={pendingArchive?.targetArchived ? 'orange' : 'blue'}
			/>
		</>
	);
};
