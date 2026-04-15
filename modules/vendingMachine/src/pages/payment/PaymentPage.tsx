/* eslint-disable max-lines-per-function */
import { ConfirmModal } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel, type ViewMode, ControlPanelFilterConfig, ControlPanelActionItem } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	PaymentDetailDrawer,
	PaymentGridView,
	PaymentTable,
	paymentSchema,
	usePaymentArchived,
	usePaymentDelete,
	usePaymentDetail,
	usePaymentList,
} from '@/features/payment';
import { PaymentMethod } from '@/features/payment/types';
import { buildSimpleSearchGraph } from '@/helpers';
import { ArchivedStatus } from '@/types';


function usePaymentFilter() {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<ArchivedStatus[]>([ArchivedStatus.ACTIVE]);
	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'search',
			type: 'search',
			value: searchValue,
			onChange: setSearchValue,
			searchFields: ['name', 'method'],
			placeholder: translate('nikki.vendingMachine.payment.search.placeholder'),
		},
		{
			key: 'isArchived',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: ArchivedStatus.ACTIVE, label: translate('nikki.general.status.active') },
				{ value: ArchivedStatus.ARCHIVED, label: translate('nikki.general.status.archived') },
			],
			placeholder: translate('nikki.vendingMachine.payment.filter.status'),
			getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
		},
	], [statusFilter, searchValue, translate]);

	const graph = useMemo(() => buildSimpleSearchGraph(filters), [filters]);

	return { filters, graph };
}

function usePaymentListPageConfig({ handleRefresh }: { handleRefresh: () => void }) {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [viewMode, setViewMode] = useState<ViewMode>('list');

	const handleCreate = useCallback(() => {
		navigate('create');
	}, [navigate]);

	const actions: ControlPanelActionItem[] = useMemo(() => [
		{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
		{ label: translate('nikki.general.actions.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' },
	], [handleCreate, translate, handleRefresh]);

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.payment.title'), href: '#' },
	], []);

	return { breadcrumbs, actions, viewMode, setViewMode };
}

const usePaymentPreview = () => {
	const [isOpenPreview, setIsOpenPreview] = useState(false);
	const [selectedPaymentId, setSelectedPaymentId] = useState<string | undefined>();

	const { payment: selectedPayment, isLoading } = usePaymentDetail(selectedPaymentId);

	const handlePreview = (payment: PaymentMethod) => {
		setSelectedPaymentId(payment.id);
		setIsOpenPreview(true);
	};

	const handleClosePreview = () => {
		setIsOpenPreview(false);
		setSelectedPaymentId(undefined);
	};

	return {
		isOpenPreview,
		handlePreview,
		handleClosePreview,
		selectedPaymentId,
		selectedPayment,
		isLoadingPreview: isLoading,
	};
};


export const PaymentPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { filters, graph } = usePaymentFilter();
	const { payments, isInitialLoading, isFetching, handleRefresh } = usePaymentList(graph);
	const { isOpenPreview, handleClosePreview, selectedPayment, isLoadingPreview, handlePreview } = usePaymentPreview();

	const { isOpenArchiveModal, pendingArchive, handleConfirmArchive,
		handleOpenArchiveModal, handleOpenRestoreModal, handleCloseModal,
	} = usePaymentArchived({ onArchiveSuccess: handleRefresh });

	const {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		paymentToDelete,
	} = usePaymentDelete({ onDeleteSuccess: handleRefresh });

	const { breadcrumbs, actions, viewMode, setViewMode } = usePaymentListPageConfig({ handleRefresh });

	return (
		<>
			<PageContainer
				documentTitle={translate('nikki.vendingMachine.menu.payment')}
				breadcrumbs={breadcrumbs}
				actionBar={
					<ControlPanel
						actions={actions}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
				isLoading={isInitialLoading}
				isEmpty={!payments?.length && !isInitialLoading && !isFetching}
			>
				{viewMode === 'list' ? (
					<PaymentTable
						columns={['method', 'name', 'isArchived', 'config', 'createdAt', 'actions']}
						data={payments}
						schema={paymentSchema as ModelSchema}
						isLoading={isInitialLoading}
						onViewDetail={handlePreview}
						onDelete={handleOpenDeleteModal}
						onArchive={handleOpenArchiveModal}
						onRestore={handleOpenRestoreModal}
					/>
				) : (
					<PaymentGridView
						payments={payments}
						isLoading={isInitialLoading}
						onViewDetail={handlePreview}
						onDelete={handleOpenDeleteModal}
						onArchive={handleOpenArchiveModal}
						onRestore={handleOpenRestoreModal}
					/>
				)}
			</PageContainer>

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

			<PaymentDetailDrawer
				opened={isOpenPreview}
				onClose={handleClosePreview}
				payment={selectedPayment}
				isLoading={isLoadingPreview}
			/>
		</>
	);
};
