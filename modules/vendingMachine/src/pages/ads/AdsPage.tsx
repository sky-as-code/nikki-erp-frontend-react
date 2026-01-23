import { Paper, Stack, Title } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdDetailDrawer, AdTable, adSchema, useAdDetail, useAdList } from '@/features/ads';
import { Ad } from '@/features/ads/types';
import { ListActions } from '@/features/common/components';


// eslint-disable-next-line max-lines-per-function
export const AdsPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { ads, isLoadingList, handleRefresh } = useAdList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Ad>();

	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
	const [selectedAdId, setSelectedAdId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { ad: selectedAd, isLoading: isLoadingDetail } = useAdDetail(selectedAdId);

	React.useEffect(() => {
		document.title = translate('nikki.vendingMachine.menu.ads');
	}, [translate]);

	// Filter and search ads
	const filteredAds = useMemo(() => {
		let filtered = ads || [];

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((ad: Ad) => ad.status === statusFilter);
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
		{ value: 'all', label: translate('nikki.general.filters.all') },
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
		{ value: 'expired', label: translate('nikki.vendingMachine.ads.status.expired') },
	];

	return (
		<>
			<Stack gap='md'>
				<Title order={5} mt='md'>{translate('nikki.vendingMachine.menu.ads')}</Title>
				<ListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
					searchValue={searchValue}
					onSearchChange={setSearchValue}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					statusOptions={statusOptions}
					searchPlaceholder={translate('nikki.vendingMachine.ads.search.placeholder')}
					filterPlaceholder={translate('nikki.vendingMachine.ads.filter.status')}
				/>
				<Paper className='p-4'>
					<AdTable
						columns={['code', 'name', 'description', 'status', 'startDate', 'endDate', 'actions']}
						data={filteredAds as unknown as Record<string, unknown>[]}
						schema={adSchema as ModelSchema}
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

			<AdDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				ad={selectedAd}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

