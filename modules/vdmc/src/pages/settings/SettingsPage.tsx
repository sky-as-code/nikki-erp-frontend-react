import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ViewMode, ActionBarFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	SettingDetailDrawer,
	SettingGridView,
	SettingTable,
	settingSchema,
	useSettingDetail,
	useSettingList,
} from '@/features/settings';
import { Setting } from '@/features/settings/types';


// eslint-disable-next-line max-lines-per-function
export const SettingsPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { settings, isLoadingList, handleRefresh } = useSettingList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Setting>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedSettingId, setSelectedSettingId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { setting: selectedSetting, isLoading: isLoadingDetail } = useSettingDetail(selectedSettingId);



	// Filter and search settings
	const filteredSettings = useMemo(() => {
		let filtered = settings || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((setting: Setting) => statusFilter.includes(setting.status));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(setting: Setting) =>
					setting.code.toLowerCase().includes(searchLower) ||
					setting.name.toLowerCase().includes(searchLower),
			) as Setting[];
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
		const setting = settings.find((s: Setting) => s.id === settingId);
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

	const filters: ActionBarFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.settings.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.settings.title');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.settings.title'), href: '#' },
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
						searchPlaceholder={translate('nikki.vendingMachine.settings.search.placeholder')}
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						viewModeSegments={['list', 'grid']}
					/>
				}
			>
				{viewMode === 'list' ? (
					<SettingTable
						columns={['code', 'name', 'description', 'category', 'value', 'status', 'actions']}
						data={filteredSettings as unknown as Record<string, unknown>[]}
						schema={settingSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<SettingGridView
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

			<SettingDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				setting={selectedSetting}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

