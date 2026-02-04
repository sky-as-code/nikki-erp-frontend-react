import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionBar, type ViewMode, ActionBarFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskTemplateDetailDrawer,
	KioskTemplateGridView,
	KioskTemplateTable,
	kioskTemplateSchema,
	useKioskTemplateDetail,
	useKioskTemplateList,
} from '@/features/kioskTemplate';
import { KioskTemplate } from '@/features/kioskTemplate/types';


// eslint-disable-next-line max-lines-per-function
export const KioskTemplatePage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { templates, isLoadingList, handleRefresh } = useKioskTemplateList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<KioskTemplate>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { template: selectedTemplate, isLoading: isLoadingDetail } = useKioskTemplateDetail(selectedTemplateId);


	// Filter and search templates
	const filteredTemplates = useMemo(() => {
		let filtered = templates || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((template: KioskTemplate) => statusFilter.includes(template.status));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(template: KioskTemplate) =>
					template.code.toLowerCase().includes(searchLower) ||
					template.name.toLowerCase().includes(searchLower),
			) as KioskTemplate[];
		}

		return filtered;
	}, [templates, statusFilter, searchValue]);

	const handleViewDetail = (templateId: string) => {
		setSelectedTemplateId(templateId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedTemplateId(undefined);
	};

	const handleOpenDeleteModal = (templateId: string) => {
		const template = templates.find((t: KioskTemplate) => t.id === templateId);
		if (template) {
			configOpenModal(template);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete template:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create template');
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
			placeholder: translate('nikki.vendingMachine.kioskTemplate.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.kiosk_template');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kioskTemplate.title'), href: '#' },
	], []);

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
						searchPlaceholder={translate('nikki.vendingMachine.kioskTemplate.search.placeholder')}
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						viewModeSegments={['list', 'grid']}
					/>
				}
			>
				{viewMode === 'list' ? (
					<KioskTemplateTable
						columns={['code', 'name', 'description', 'status', 'actions']}
						data={filteredTemplates as unknown as Record<string, unknown>[]}
						schema={kioskTemplateSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<KioskTemplateGridView
						templates={filteredTemplates}
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

			<KioskTemplateDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				template={selectedTemplate}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

