import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel, type ViewMode, ControlPanelFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import { SlideshowDetailDrawer, SlideshowGridView, SlideshowTable, slideshowSchema, useSlideshowDetail, useSlideshowList } from '@/features/slideshow';
import { Slideshow } from '@/features/slideshow/types';


// eslint-disable-next-line max-lines-per-function
export const SlideshowsPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { slideshows, isLoadingList, handleRefresh } = useSlideshowList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Slideshow>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedSlideshowId, setSelectedSlideshowId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { slideshow: selectedSlideshow, isLoading: isLoadingDetail } = useSlideshowDetail(selectedSlideshowId);



	const filteredSlideshows = useMemo(() => {
		let filtered = slideshows || [];

		if (statusFilter.length > 0) {
			filtered = filtered.filter((slideshow: Slideshow) => statusFilter.includes(slideshow.status));
		}

		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(slideshow: Slideshow) =>
					slideshow.code.toLowerCase().includes(searchLower) ||
					slideshow.name.toLowerCase().includes(searchLower),
			) as Slideshow[];
		}

		return filtered;
	}, [slideshows, statusFilter, searchValue]);

	const handleViewDetail = (slideshowId: string) => {
		setSelectedSlideshowId(slideshowId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedSlideshowId(undefined);
	};

	const handleOpenDeleteModal = (slideshowId: string) => {
		const slideshow = slideshows.find((a: Slideshow) => a.id === slideshowId);
		if (slideshow) {
			configOpenModal(slideshow);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete slideshow:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create slideshow');
	};

	const statusOptions = [
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
		{ value: 'expired', label: translate('nikki.vendingMachine.slideshow.status.expired') },
	];

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.slideshow.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.slideshow');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.slideshow.title'), href: '#' },
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
						search={{ value: searchValue, onChange: setSearchValue, placeholder: translate('nikki.vendingMachine.slideshow.search.placeholder') }}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<SlideshowTable
						columns={['code', 'name', 'description', 'status', 'startDate', 'endDate', 'actions']}
						data={filteredSlideshows as unknown as Record<string, unknown>[]}
						schema={slideshowSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<SlideshowGridView
						slideshows={filteredSlideshows}
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

			<SlideshowDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				slideshow={selectedSlideshow}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
