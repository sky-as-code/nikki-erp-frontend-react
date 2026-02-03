import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ViewMode, type FilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskSettingDetailDrawer,
	KioskSettingGridView,
	KioskSettingTable,
	kioskSettingSchema,
	useKioskSettingDetail,
	useKioskSettingList,
} from '@/features/kioskSettings';
import { KioskSetting } from '@/features/kioskSettings/types';


// eslint-disable-next-line max-lines-per-function
export const KioskSettingsPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { settings, isLoadingList, handleRefresh } = useKioskSettingList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<KioskSetting>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedSettingId, setSelectedSettingId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { setting: selectedSetting, isLoading: isLoadingDetail } = useKioskSettingDetail(selectedSettingId);



	// Filter and search settings
	const filteredSettings = useMemo(() => {
		let filtered = settings || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((setting: KioskSetting) => statusFilter.includes(setting.status));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(setting: KioskSetting) =>
					setting.code.toLowerCase().includes(searchLower) ||
					setting.name.toLowerCase().includes(searchLower),
			) as KioskSetting[];
		}

		return filtered;
	}, [settings, statusFilter, searchValue]);

	const handleViewDetail = (settingId: string) => {
		setSelectedSettingId(settingId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedSettingId(undefined);
	};

	const handleOpenDeleteModal = (settingId: string) => {
		const setting = settings.find((s: KioskSetting) => s.id === settingId);
		if (setting) {
			configOpenModal(setting);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete setting:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create setting');
	};

	const statusOptions = [
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
	];

	const filters: FilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.kioskSettings.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.kiosk_settings');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.menu.kiosk_settings'), href: '#' },
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
						searchPlaceholder={translate('nikki.vendingMachine.kioskSettings.search.placeholder')}
						viewMode={viewMode}
						onViewModeChange={setViewMode}
					/>
				}
			>
				{viewMode === 'list' ? (
					<KioskSettingTable
						columns={['code', 'name', 'description', 'category', 'value', 'status', 'actions']}
						data={filteredSettings as unknown as Record<string, unknown>[]}
						schema={kioskSettingSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<KioskSettingGridView
						settings={filteredSettings}
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

			<KioskSettingDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				setting={selectedSetting}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

