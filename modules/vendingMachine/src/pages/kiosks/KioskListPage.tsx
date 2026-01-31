import { Paper, Stack, Title } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	KioskDetailDrawer,
	KioskGridView,
	KioskMapView,
	KioskListActions,
	KioskTable,
	kioskSchema,
	type Kiosk,
	type ViewMode,
	useKioskDelete,
	useKioskDetail,
	useKioskList,
	KioskListActionsWithFilter,
} from '@/features/kiosks';
import { ConnectionStatus, KioskMode, KioskStatus } from '@/features/kiosks/types';


// eslint-disable-next-line max-lines-per-function
export const KioskListPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { kiosks, isLoadingList, handleRefresh } = useKioskList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Kiosk>();
	const confirmDelete = useKioskDelete(handleRefresh);

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<KioskStatus | 'all'>('all');
	const [connectionFilter, setConnectionFilter] = useState<ConnectionStatus | 'all'>('all');
	const [modeFilter, setModeFilter] = useState<KioskMode | 'all'>('all');
	const [selectedKioskId, setSelectedKioskId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { kiosk: selectedKiosk, isLoading: isLoadingDetail } = useKioskDetail(selectedKioskId);

	// Filter and search kiosks
	const filteredKiosks = useMemo(() => {
		let filtered = kiosks || [];

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((k: Kiosk) => k.status === statusFilter);
		}

		// Filter by connection status
		if (connectionFilter !== 'all') {
			filtered = filtered.filter((k: Kiosk) => k.connectionStatus === connectionFilter);
		}

		// Filter by mode
		if (modeFilter !== 'all') {
			filtered = filtered.filter((k: Kiosk) => k.mode === modeFilter);
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(k: Kiosk) =>
					k.code.toLowerCase().includes(searchLower) ||
					k.name.toLowerCase().includes(searchLower),
			) as Kiosk[];
		}

		return filtered;
	}, [kiosks, statusFilter, connectionFilter, modeFilter, searchValue]);

	const handleViewDetail = (kioskId: string) => {
		setSelectedKioskId(kioskId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedKioskId(undefined);
	};

	const handleOpenDeleteModal = (kioskId: string) => {
		const kiosk = kiosks.find((k: Kiosk) => k.id === kioskId);
		if (kiosk) {
			configOpenModal(kiosk);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) confirmDelete(item);
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create kiosk');
	};

	const handleSearchGraphChange = (graph: any) => {
		console.log('graph', graph);
	};

	useDocumentTitle('nikki.vendingMachine.kiosk.title');

	return (
		<>
			<Stack gap='md'>
				<Title order={5} mt='md'>{translate('nikki.vendingMachine.kiosk.title')}</Title>
				<KioskListActionsWithFilter
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					onCreate={handleCreate}
					onRefresh={handleRefresh}
					onSearchGraphChange={handleSearchGraphChange}
				/>
				<Paper className='p-4'>
					{viewMode === 'list' ? (
						<KioskTable
							columns={['code', 'name', 'connectionStatus', 'address', 'status', 'mode', 'actions']}
							data={filteredKiosks}
							schema={kioskSchema as ModelSchema}
							isLoading={isLoadingList}
							onViewDetail={handleViewDetail}
							onDelete={handleOpenDeleteModal}
						/>
					) : viewMode === 'grid' ? (
						<KioskGridView
							kiosks={filteredKiosks}
							isLoading={isLoadingList}
							onViewDetail={handleViewDetail}
							onDelete={handleOpenDeleteModal}
						/>
					) : (
						<KioskMapView
							kiosks={filteredKiosks}
							isLoading={isLoadingList}
							onViewDetail={handleViewDetail}
						/>
					)}
				</Paper>

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
			</Stack>

			<KioskDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				kiosk={selectedKiosk}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

