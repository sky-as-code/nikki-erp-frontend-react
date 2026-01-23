import { Paper, Stack, Title } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ListActions } from '@/features/common/components';
import {
	KioskTemplateDetailDrawer,
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

	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { template: selectedTemplate, isLoading: isLoadingDetail } = useKioskTemplateDetail(selectedTemplateId);

	React.useEffect(() => {
		document.title = translate('nikki.vendingMachine.menu.kiosk_template');
	}, [translate]);

	// Filter and search templates
	const filteredTemplates = useMemo(() => {
		let filtered = templates || [];

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((template: KioskTemplate) => template.status === statusFilter);
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
		{ value: 'all', label: translate('nikki.general.filters.all') },
		{ value: 'active', label: translate('nikki.general.status.active') },
		{ value: 'inactive', label: translate('nikki.general.status.inactive') },
	];

	return (
		<>
			<Stack gap='md'>
				<Title order={5} mt='md'>{translate('nikki.vendingMachine.menu.kiosk_template')}</Title>
				<ListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
					searchValue={searchValue}
					onSearchChange={setSearchValue}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					statusOptions={statusOptions}
					searchPlaceholder={translate('nikki.vendingMachine.kioskTemplate.search.placeholder')}
					filterPlaceholder={translate('nikki.vendingMachine.kioskTemplate.filter.status')}
				/>
				<Paper className='p-4'>
					<KioskTemplateTable
						columns={['code', 'name', 'description', 'status', 'actions']}
						data={filteredTemplates as unknown as Record<string, unknown>[]}
						schema={kioskTemplateSchema as ModelSchema}
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

			<KioskTemplateDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				template={selectedTemplate}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};

