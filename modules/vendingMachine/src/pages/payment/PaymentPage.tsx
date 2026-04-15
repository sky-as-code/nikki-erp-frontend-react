import { ConfirmModal } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ControlPanel, type ViewMode, ControlPanelFilterConfig, ControlPanelActionItem } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	PaymentDetailDrawer,
	PaymentGridView,
	PaymentTable,
	paymentSchema,
	usePaymentArchived,
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
	const [viewMode, setViewMode] = useState<ViewMode>('list');

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create payment');
	};

	const actions: ControlPanelActionItem[] = useMemo(() => [
		{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
		{ label: translate('nikki.general.actions.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' },
	], [handleCreate, translate]);

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
	const { payments, isLoadingList, handleRefresh } = usePaymentList(graph);
	const { isOpenPreview, handleClosePreview, selectedPayment, isLoadingPreview, handlePreview } = usePaymentPreview();

	const { isOpenArchiveModal, pendingArchive, handleConfirmArchive,
		handleOpenArchiveModal, handleOpenRestoreModal, handleCloseModal,
	} = usePaymentArchived({ onArchiveSuccess: handleRefresh });

	const { breadcrumbs, actions, viewMode, setViewMode } = usePaymentListPageConfig({handleRefresh});

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
			>
				{viewMode === 'list' ? (
					<PaymentTable
						columns={['method', 'name', 'isArchived', 'config', 'createdAt', 'actions']}
						data={payments}
						schema={paymentSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handlePreview}
						onArchive={handleOpenArchiveModal}
						onRestore={handleOpenRestoreModal}
					/>
				) : (
					<PaymentGridView
						payments={payments}
						isLoading={isLoadingList}
						onViewDetail={handlePreview}
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

			<PaymentDetailDrawer
				opened={isOpenPreview}
				onClose={handleClosePreview}
				payment={selectedPayment}
				isLoading={isLoadingPreview}
			/>
		</>
	);
};
