import { ConfirmModal } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ControlPanel } from '@/components';
import { ControlPanelViewModeProps } from '@/components/ControlPanel/ControlPanelViewMode';
import { PageContainer } from '@/components/PageContainer';
import {
	PaymentDetailDrawer,
	PaymentGridView,
	PaymentListPageProvider,
	PaymentTable,
	PaymentTableActions,
	type PaymentMethod,
	paymentSchema,
	usePaymentListPageActions,
	usePaymentListPageConfig,
	usePaymentListPageContext,
} from '@/features/payment';


export const PaymentListPage: React.FC = () => {
	return (
		<PaymentListPageProvider>
			<PaymentListPageContent />
		</PaymentListPageProvider>
	);
};

const PAYMENT_TABLE_COLUMNS = ['name', 'method', 'isArchived', 'transactionRange', 'actions'];

export const PaymentListPageContent: React.FC = () => {
	const { t: translate } = useTranslation();

	const { filter: { filters }, list: { payments, isLoading, isEmpty } } = usePaymentListPageContext();
	const { breadcrumbs, actions, viewModeConfig } = usePaymentListPageConfig();
	const { preview, delete: deletePayment, archive } = usePaymentListPageActions();

	const paymentTableActions: PaymentTableActions = {
		view: preview.handlePreview,
		archive: archive.handleOpenArchiveModal,
		restore: archive.handleOpenRestoreModal,
		delete: deletePayment.handleOpenDeleteModal,
	};

	return (
		<>
			<PageContainer
				documentTitle={translate('nikki.vendingMachine.menu.payment')}
				breadcrumbs={breadcrumbs}
				sections={[
					<ControlPanel
						key='payment-list-control'
						actions={actions}
						filters={filters}
						viewMode={viewModeConfig as ControlPanelViewModeProps}
					/>,
				]}
				isLoading={isLoading}
				isEmpty={isEmpty}
			>
				<PaymentList
					payments={payments}
					viewMode={viewModeConfig.value}
					isLoading={isLoading}
					actions={paymentTableActions}
				/>
			</PageContainer>

			<ArchivePaymentModal />
			<DeletePaymentModal />
			<PaymentPreviewDrawer />
		</>
	);
};

const PaymentPreviewDrawer: React.FC = () => {
	const { preview } = usePaymentListPageActions();

	return (
		<PaymentDetailDrawer
			opened={preview.isOpenPreview}
			onClose={preview.handleClosePreview}
			payment={preview.selectedPayment}
			isLoading={preview.isLoadingPreview}
		/>
	);
};

const ArchivePaymentModal: React.FC = () => {
	const { t: translate } = useTranslation();
	const {
		pendingArchive,
		isOpenArchiveModal,
		handleCloseModal,
		handleConfirmArchive,
	} = usePaymentListPageActions().archive;

	return (
		<ConfirmModal
			opened={!!pendingArchive && isOpenArchiveModal}
			onClose={handleCloseModal}
			onConfirm={handleConfirmArchive}
			title={pendingArchive?.targetArchived
				? translate('nikki.vendingMachine.payment.messages.archive_modal_title')
				: translate('nikki.vendingMachine.payment.messages.restore_modal_title')}
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
				? translate('nikki.general.actions.archive')
				: translate('nikki.general.actions.restore')}
			confirmColor={pendingArchive?.targetArchived ? 'orange' : 'blue'}
		/>
	);
};

const DeletePaymentModal: React.FC = () => {
	const { t: translate } = useTranslation();
	const {
		paymentToDelete,
		isOpenDeleteModal,
		handleCloseDeleteModal,
		handleDelete,
	} = usePaymentListPageActions().delete;

	return (
		<ConfirmModal
			title={translate('nikki.general.messages.delete_confirm')}
			opened={!!paymentToDelete && isOpenDeleteModal}
			onClose={handleCloseDeleteModal}
			onConfirm={() => handleDelete(paymentToDelete?.id || '')}
			message={
				<Trans
					i18nKey='nikki.vendingMachine.payment.messages.delete_confirm'
					values={{ name: paymentToDelete?.name || '' }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={translate('nikki.general.actions.delete')}
			confirmColor='red'
		/>
	);
};

type PaymentListProps = {
	payments: PaymentMethod[];
	viewMode: 'list' | 'grid';
	isLoading: boolean;
	actions: PaymentTableActions;
};

function PaymentList({ payments, viewMode, isLoading, actions }: PaymentListProps) {
	switch (viewMode) {
		case 'grid':
			return (
				<PaymentGridView
					payments={payments}
					isLoading={isLoading}
					actions={actions}
				/>
			);
		case 'list':
		default:
			return (
				<PaymentTable
					columns={PAYMENT_TABLE_COLUMNS}
					data={payments as unknown as Record<string, unknown>[]}
					schema={paymentSchema as ModelSchema}
					isLoading={isLoading}
					actions={actions}
				/>
			);
	}
}
