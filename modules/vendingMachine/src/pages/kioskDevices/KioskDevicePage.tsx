import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ViewMode, type FilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskDeviceDetailDrawer,
	KioskDeviceGridView,
	KioskDeviceTable,
	kioskDeviceSchema,
	useKioskDeviceDetail,
	useKioskDeviceList,
} from '@/features/kioskDevices';
import { KioskDevice } from '@/features/kioskDevices/types';


// eslint-disable-next-line max-lines-per-function
export const KioskDevicePage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { kioskDevices, isLoadingList, handleRefresh } = useKioskDeviceList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<KioskDevice>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [deviceTypeFilter, setDeviceTypeFilter] = useState<string[]>([]);
	const [selectedKioskDeviceId, setSelectedKioskDeviceId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { kioskDevice: selectedKioskDevice, isLoading: isLoadingDetail } = useKioskDeviceDetail(selectedKioskDeviceId);


	// Filter and search kiosk devices
	const filteredKioskDevices = useMemo(() => {
		let filtered = kioskDevices || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((kioskDevice: KioskDevice) => statusFilter.includes(kioskDevice.status));
		}

		// Filter by device type
		if (deviceTypeFilter.length > 0) {
			filtered = filtered.filter((kioskDevice: KioskDevice) => deviceTypeFilter.includes(kioskDevice.deviceType));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(kioskDevice: KioskDevice) =>
					kioskDevice.code.toLowerCase().includes(searchLower) ||
					kioskDevice.name.toLowerCase().includes(searchLower),
			) as KioskDevice[];
		}

		return filtered;
	}, [kioskDevices, statusFilter, deviceTypeFilter, searchValue]);

	const handleViewDetail = (kioskDeviceId: string) => {
		setSelectedKioskDeviceId(kioskDeviceId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedKioskDeviceId(undefined);
	};

	const handleOpenDeleteModal = (kioskDeviceId: string) => {
		const kioskDevice = kioskDevices.find((d: KioskDevice) => d.id === kioskDeviceId);
		if (kioskDevice) {
			configOpenModal(kioskDevice);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete kiosk device:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create kiosk device');
	};

	const statusOptions = [
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
	];

	const deviceTypeOptions = [
		{ value: 'motor', label: translate('nikki.vendingMachine.device.deviceType.motor') },
		{ value: 'pos', label: translate('nikki.vendingMachine.device.deviceType.pos') },
		{ value: 'screen', label: translate('nikki.vendingMachine.device.deviceType.screen') },
		{ value: 'cpu', label: translate('nikki.vendingMachine.device.deviceType.cpu') },
		{ value: 'router', label: translate('nikki.vendingMachine.device.deviceType.router') },
	];

	const filters: FilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.device.filter.status'),
		},
		{
			value: deviceTypeFilter,
			onChange: setDeviceTypeFilter,
			options: deviceTypeOptions,
			placeholder: translate('nikki.vendingMachine.device.filter.deviceType'),
		},
	], [statusFilter, deviceTypeFilter, statusOptions, deviceTypeOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.device');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.menu.device'), href: '#' },
	], [translate]);

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={
					<ActionBar
						onCreate={handleCreate}
						onRefresh={handleRefresh}
						searchValue={searchValue}
						onSearchChange={setSearchValue}
						filters={filters}
						searchPlaceholder={translate('nikki.vendingMachine.device.search.placeholder')}
						viewMode={viewMode}
						onViewModeChange={setViewMode}
					/>
				}
			>
				{viewMode === 'list' ? (
					<KioskDeviceTable
						columns={['code', 'name', 'deviceType', 'description', 'status', 'specifications', 'actions']}
						data={filteredKioskDevices as unknown as Record<string, unknown>[]}
						schema={kioskDeviceSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<KioskDeviceGridView
						kioskDevices={filteredKioskDevices}
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

			<KioskDeviceDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				kioskDevice={selectedKioskDevice}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
