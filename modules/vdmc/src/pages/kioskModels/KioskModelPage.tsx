import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel, type ViewMode, ControlPanelFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskModelDetailDrawer,
	KioskModelGridView,
	KioskModelTable,
	kioskModelSchema,
	useKioskModelDetail,
	useKioskModelList,
} from '@/features/kioskModels';
import { KioskModel } from '@/features/kioskModels/types';


export const KioskModelPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { models, isLoadingList, handleRefresh } = useKioskModelList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<KioskModel>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedModelId, setSelectedModelId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { model: selectedModel, isLoading: isLoadingDetail } = useKioskModelDetail(selectedModelId);

	const filteredModels = useMemo(() => {
		let filtered = models || [];

		if (statusFilter.length > 0) {
			filtered = filtered.filter((m: KioskModel) => statusFilter.includes(m.status));
		}

		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(m: KioskModel) =>
					m.code.toLowerCase().includes(searchLower) ||
					m.name.toLowerCase().includes(searchLower),
			) as KioskModel[];
		}

		return filtered;
	}, [models, statusFilter, searchValue]);

	const handleViewDetail = (modelId: string) => {
		setSelectedModelId(modelId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedModelId(undefined);
	};

	const handleOpenDeleteModal = (modelId: string) => {
		const model = models?.find((m: KioskModel) => m.id === modelId);
		if (model) {
			configOpenModal(model);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			console.log('Delete model:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		console.log('Create model');
	};

	const statusOptions = [
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
	];

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: statusOptions,
			placeholder: translate('nikki.vendingMachine.kioskModels.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.kiosk_model');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskModels.title'), href: '#' },
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
						search={{ value: searchValue, onChange: setSearchValue, placeholder: translate('nikki.vendingMachine.kioskModels.search.placeholder') }}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<KioskModelTable
						columns={['code', 'name', 'description', 'status', 'actions']}
						data={filteredModels as unknown as Record<string, unknown>[]}
						schema={kioskModelSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<KioskModelGridView
						models={filteredModels}
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

			<KioskModelDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				model={selectedModel}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
