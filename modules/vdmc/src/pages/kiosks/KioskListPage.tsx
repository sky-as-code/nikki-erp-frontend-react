import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel, ControlPanelFilterConfig, ViewMode } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskDetailDrawer,
	KioskGridView,
	KioskMapView,
	KioskTable,
	kioskSchema,
	type Kiosk,
	useKioskDelete,
	useKioskDetail,
	useKioskList,
} from '@/features/kiosks';
import { ConnectionStatus, KioskMode, KioskStatus } from '@/features/kiosks/types';


// eslint-disable-next-line max-lines-per-function
export const KioskListPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { kiosks = [], isLoadingList, handleRefresh } = useKioskList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Kiosk>();
	const confirmDelete = useKioskDelete(handleRefresh);

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<KioskStatus[]>([]);
	const [connectionFilter, setConnectionFilter] = useState<ConnectionStatus[]>([]);
	const [modeFilter, setModeFilter] = useState<KioskMode[]>([]);
	const [selectedKioskId, setSelectedKioskId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { kiosk: selectedKiosk, isLoading: isLoadingDetail } = useKioskDetail(selectedKioskId);

	// Filter and search kiosks
	const filteredKiosks = useMemo(() => {
		let filtered = kiosks || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((k: Kiosk) => statusFilter.includes(k.status));
		}

		// Filter by connection status
		if (connectionFilter.length > 0) {
			filtered = filtered.filter((k: Kiosk) => connectionFilter.includes(k.connectionStatus));
		}

		// Filter by mode
		if (modeFilter.length > 0) {
			filtered = filtered.filter((k: Kiosk) => modeFilter.includes(k.mode));
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

	const handleSearchGraphChange = useCallback((graph: any) => {
		console.debug('🚀 ~ handleSearchGraphChange ~ graph:', graph);
	}, []);

	useDocumentTitle('nikki.vendingMachine.kiosk.title');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kiosk.title'), href: '#' },
	], []);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: (value: string[]) => setStatusFilter(value as KioskStatus[]),
			options: [
				{ value: 'active', label: translate('nikki.general.status.active') },
				{ value: 'inactive', label: translate('nikki.general.status.inactive') },
			],
		},
		{
			value: connectionFilter,
			onChange: (value: string[]) => setConnectionFilter(value as ConnectionStatus[]),
			options: [
				{ value: 'fast', label: translate('nikki.vendingMachine.kiosk.connectionStatus.fast') },
				{ value: 'slow', label: translate('nikki.vendingMachine.kiosk.connectionStatus.slow') },
				{ value: 'disconnected', label: translate('nikki.vendingMachine.kiosk.connectionStatus.disconnected') },
			],
		},
		{
			value: modeFilter,
			onChange: (value: string[]) => setModeFilter(value as KioskMode[]),
			options: [
				{ value: KioskMode.PENDING, label: translate('nikki.vendingMachine.kiosk.mode.pending') },
				{ value: KioskMode.SELLING, label: translate('nikki.vendingMachine.kiosk.mode.selling') },
				{ value: KioskMode.ADSONLY, label: translate('nikki.vendingMachine.kiosk.mode.adsOnly') },
			],
		},
	], [statusFilter, connectionFilter, modeFilter]);

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				// actionBar={
				// 	<KioskListActionsWithFilter
				// 		viewMode={viewMode}
				// 		onViewModeChange={setViewMode}
				// 		onCreate={handleCreate}
				// 		onRefresh={handleRefresh}
				// 		onSearchGraphChange={handleSearchGraphChange}
				// 	/>
				// }
				sections={[
					<ControlPanel
						actions={[
							{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
							{ label: translate('nikki.general.actions.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' },
						]}
						search={{ value: searchValue, onChange: setSearchValue, placeholder: translate('nikki.vendingMachine.kiosk.search.placeholder') }}
						filters={filters}
						viewMode={{ value: viewMode, onChange: (mode: ViewMode) => setViewMode(mode), segments: ['list', 'grid', 'map'] }}
					/>,
				]}
			>
				{viewMode === 'list' ? (
					<KioskTable
						columns={['code', 'name', 'connectionStatus', 'address', 'status', 'mode', 'warnings', 'actions']}
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
					<KioskMapView kiosks={kiosks} />
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
			<KioskDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				kiosk={selectedKiosk}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

