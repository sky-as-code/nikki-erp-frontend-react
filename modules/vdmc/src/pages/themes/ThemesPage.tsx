import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal, useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { ControlPanel, type ViewMode, ControlPanelFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import { ThemeDetailDrawer, ThemeGridView, ThemeTable, themeSchema, useThemeDetail, useThemeList } from '@/features/themes';
import { Theme } from '@/features/themes/types';


// eslint-disable-next-line max-lines-per-function
export const ThemesPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { themes, isLoadingList, handleRefresh } = useThemeList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Theme>();

	const [viewMode, setViewMode] = useState<ViewMode>('list');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { theme: selectedTheme, isLoading: isLoadingDetail } = useThemeDetail(selectedThemeId);



	// Filter and search themes
	const filteredThemes = useMemo(() => {
		let filtered = themes || [];

		// Filter by status
		if (statusFilter.length > 0) {
			filtered = filtered.filter((theme: Theme) => statusFilter.includes(theme.status));
		}

		// Search by code or name
		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(theme: Theme) =>
					theme.code.toLowerCase().includes(searchLower) ||
					theme.name.toLowerCase().includes(searchLower),
			) as Theme[];
		}

		return filtered;
	}, [themes, statusFilter, searchValue]);

	const handleViewDetail = (themeId: string) => {
		setSelectedThemeId(themeId);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedThemeId(undefined);
	};

	const handleOpenDeleteModal = (themeId: string) => {
		const theme = themes.find((t: Theme) => t.id === themeId);
		if (theme) {
			configOpenModal(theme);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			// TODO: Implement delete
			console.log('Delete theme:', item.id);
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		// TODO: Navigate to create page
		console.log('Create theme');
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
			placeholder: translate('nikki.vendingMachine.themes.filter.status'),
		},
	], [statusFilter, statusOptions, translate]);

	useDocumentTitle('nikki.vendingMachine.menu.themes');

	const breadcrumbs = useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.menu.themes'), href: '#' },
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
						search={{ value: searchValue, onChange: setSearchValue, placeholder: translate('nikki.vendingMachine.themes.search.placeholder') }}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<ThemeTable
						columns={['code', 'name', 'description', 'status', 'primaryColor', 'actions']}
						data={filteredThemes as unknown as Record<string, unknown>[]}
						schema={themeSchema as ModelSchema}
						isLoading={isLoadingList}
						onViewDetail={handleViewDetail}
						onDelete={handleOpenDeleteModal}
					/>
				) : (
					<ThemeGridView
						themes={filteredThemes}
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

			<ThemeDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				theme={selectedTheme}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
