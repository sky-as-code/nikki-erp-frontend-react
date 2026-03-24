import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { ControlPanel, type ViewMode, ControlPanelFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	PaymentDetailDrawer,
	PaymentGridView,
	PaymentTable,
	paymentSchema,
	usePaymentDetail,
	usePaymentList,
} from '@/features/payment';
import { PaymentMethod } from '@/features/payment/types';


// eslint-disable-next-line max-lines-per-function
export const PaymentPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { payments, isLoadingList, handleRefresh } = usePaymentList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<PaymentMethod>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedPaymentId, setSelectedPaymentId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { payment: selectedPayment, isLoading: isLoadingDetail } = usePaymentDetail(selectedPaymentId);


	// Filter and search payments
	const filteredPayments = useMemo(() => {
		let filtered = payments || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((payment: PaymentMethod) => statusFilter.includes(payment.status));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(payment: PaymentMethod) =>
					payment.code.toLowerCase().includes(searchLower) ||
					payment.name.toLowerCase().includes(searchLower),
			) as PaymentMethod[];
		}

		return filtered;
	}, [payments, statusFilter, searchValue]);

	const handleViewDetail = (paymentId: string) => {
		setSelectedPaymentId(paymentId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedPaymentId(undefined);
	};

	const handleOpenDeleteModal = (paymentId: string) => {
		const payment = payments.find((p: PaymentMethod) => p.id === paymentId);
		if (payment) {
			configOpenModal(payment);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete payment:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create payment');
	};

	const statusOptions = [
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
	];

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.payment.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.payment');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.payment.title'), href: '#' },
	], []);

	// Prepare table data with transaction range column
	const tableData = useMemo(() => {
		return filteredPayments.map((payment: PaymentMethod) => ({
			...payment,
			transactionRange: `${payment.minTransactionValue || 0} - ${payment.maxTransactionValue || '∞'}`,
		}));
	}, [filteredPayments]);

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={
					<ControlPanel
						actions={[
							{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
							{ label: translate('nikki.general.actions.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' },
						]}
						search={{ value: searchValue, onChange: setSearchValue, placeholder: translate('nikki.vendingMachine.payment.search.placeholder') }}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<PaymentTable
						columns={['code', 'name', 'description', 'status', 'transactionRange', 'actions']}
						data={tableData as unknown as Record<string, unknown>[]}
						schema={paymentSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<PaymentGridView
						payments={filteredPayments}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				)}
			</PageContainer>

			<ConfirmModal
				opened={isOpen}
				onClose={handleCloseModal}
				onConfirm={handleDeleteConfirm}
				title={translate('nikki.general.messages.delete_confirm')}
				message={
					item
						? translate('nikki.general.messages.delete_confirm_name', { name: item.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<PaymentDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				payment={selectedPayment}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
