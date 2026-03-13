import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type ViewMode, ControlPanel, ControlPanelFilterConfig } from '@/components';
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
export const KioskSettingPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { settings, isLoadingList, handleRefresh } = useKioskSettingList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<KioskSetting>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedSettingId, setSelectedSettingId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { setting: selectedSetting, isLoading: isLoadingDetail } = useKioskSettingDetail(selectedSettingId);

	const filteredSettings = useMemo(() => {
		let filtered = settings || [];
		if (statusFilter.length > 0) {
			filtered = filtered.filter((s: KioskSetting) => statusFilter.includes(s.status));
		}
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(s: KioskSetting) =>
					s.code.toLowerCase().includes(searchLower) ||
					s.name.toLowerCase().includes(searchLower),
			) as KioskSetting[];
		}
		return filtered;
	}, [settings, statusFilter, searchValue]);

	const handleViewDetail = (id: string) => {
		setSelectedSettingId(id);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedSettingId(undefined);
	};

	const handleOpenDeleteModal = (id: string) => {
		const s = settings?.find((x: KioskSetting) => x.id === id);
		if (s) configOpenModal(s);
	};

	const handleDeleteConfirm = () => {
		if (item) console.log('Delete setting:', item.id);
		handleCloseModal();
	};



	useDocumentTitle('nikki.vendingMachine.menu.kiosk_settings');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskSettings.title'), href: '#' },
	], [translate]);

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				sections={[
					<KioskSettingsControlPanel
						viewMode={viewMode}
						setViewMode={setViewMode}
						searchValue={searchValue}
						setSearchValue={setSearchValue}
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						handleRefresh={handleRefresh}
					/>,
				]}
			>
				{viewMode === 'list' ? (
					<KioskSettingTable
						columns={['code', 'name', 'description', 'status', 'actions']}
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


const KioskSettingsControlPanel: React.FC<{
	viewMode: ViewMode;
	setViewMode: (viewMode: ViewMode) => void;
	searchValue: string;
	setSearchValue: (searchValue: string) => void;
	statusFilter: string[];
	setStatusFilter: (statusFilter: string[]) => void;
	handleRefresh: () => void;
}> = ({ viewMode, setViewMode, searchValue, setSearchValue, statusFilter, setStatusFilter, handleRefresh }) => {

	const { t: translate } = useTranslation();

	const statusOptions = [
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
	];

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.kioskSettings.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);


	return (
		<ControlPanel
			actions={[
				{
					label: translate('nikki.general.actions.create'),
					leftSection: <IconPlus size={16} />,
					onClick: () => console.log('create new kiosk setting'),
				},
				{
					label: translate('nikki.general.actions.refresh'),
					leftSection: <IconRefresh size={16} />,
					onClick: handleRefresh,
					variant: 'outline',
				},
			]}
			viewMode={{
				value: viewMode,
				onChange: setViewMode,
				segments: ['list', 'grid'],
			}}
			filters={filters}
			search={
				{
					value: searchValue,
					onChange: setSearchValue,
					placeholder: translate('nikki.vendingMachine.kioskSettings.search.placeholder'),
				}
			}
		/>
	);
};