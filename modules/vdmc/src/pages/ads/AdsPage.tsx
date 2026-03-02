import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { ControlPanel, type ViewMode, ControlPanelFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import { AdDetailDrawer, AdGridView, AdTable, adSchema, useAdDetail, useAdList } from '@/features/ads';
import { Ad } from '@/features/ads/types';


// eslint-disable-next-line max-lines-per-function
export const AdsPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { ads, isLoadingList, handleRefresh } = useAdList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Ad>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedAdId, setSelectedAdId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { ad: selectedAd, isLoading: isLoadingDetail } = useAdDetail(selectedAdId);



	// Filter and search ads
	const filteredAds = useMemo(() => {
		let filtered = ads || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((ad: Ad) => statusFilter.includes(ad.status));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(ad: Ad) =>
					ad.code.toLowerCase().includes(searchLower) ||
					ad.name.toLowerCase().includes(searchLower),
			) as Ad[];
		}

		return filtered;
	}, [ads, statusFilter, searchValue]);

	const handleViewDetail = (adId: string) => {
		setSelectedAdId(adId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedAdId(undefined);
	};

	const handleOpenDeleteModal = (adId: string) => {
		const ad = ads.find((a: Ad) => a.id === adId);
		if (ad) {
			configOpenModal(ad);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete ad:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create ad');
	};

	const statusOptions = [
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
		{ value: 'expired', label: translate('nikki.vendingMachine.ads.status.expired') },
	];

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.ads.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.ads');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.ads.title'), href: '#' },
	], [translate]);

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
						search={{ value: searchValue, onChange: setSearchValue, placeholder: translate('nikki.vendingMachine.ads.search.placeholder') }}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<AdTable
						columns={['code', 'name', 'description', 'status', 'startDate', 'endDate', 'actions']}
						data={filteredAds as unknown as Record<string, unknown>[]}
						schema={adSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<AdGridView
						ads={filteredAds}
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

			<AdDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				ad={selectedAd}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

