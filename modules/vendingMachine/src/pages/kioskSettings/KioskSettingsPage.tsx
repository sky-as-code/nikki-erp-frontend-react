import { Paper, Stack, Title } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ListActions } from '@/components';
import {
	KioskSettingDetailDrawer,
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

	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
	const [selectedSettingId, setSelectedSettingId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { setting: selectedSetting, isLoading: isLoadingDetail } = useKioskSettingDetail(selectedSettingId);



	// Filter and search settings
	const filteredSettings = useMemo(() => {
		let filtered = settings || [];

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((setting: KioskSetting) => setting.status === statusFilter);
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
		{ value: 'all', label: translate('nikki.general.filters.all') },
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
	];

	useDocumentTitle('nikki.vendingMachine.menu.kiosk_settings');

	return (
		<>
			<Stack gap='md'>
				<Title order={5} mt='md'>{translate('nikki.vendingMachine.menu.kiosk_settings')}</Title>
				<ListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
					searchValue={searchValue}
					onSearchChange={setSearchValue}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					statusOptions={statusOptions}
					searchPlaceholder={translate('nikki.vendingMachine.kioskSettings.search.placeholder')}
					filterPlaceholder={translate('nikki.vendingMachine.kioskSettings.filter.status')}
				/>
				<Paper className='p-4'>
					<KioskSettingTable
						columns={['code', 'name', 'description', 'category', 'value', 'status', 'actions']}
						data={filteredSettings as unknown as Record<string, unknown>[]}
						schema={kioskSettingSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
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

			<KioskSettingDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				setting={selectedSetting}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

