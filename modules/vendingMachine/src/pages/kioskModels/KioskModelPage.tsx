import { ConfirmModal } from '@nikkierp/ui/components';
import { useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ControlPanel, ControlPanelFilterConfig, ViewMode } from '@/components';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskModelDetailDrawer,
	KioskModelGridView,
	kioskModelSchema,
	KioskModelTable,
	useKioskModelDelete,
	useKioskModelList,
	useKioskModelPageConfig,
	useKioskModelPreview,
} from '@/features/kioskModels';
import { KioskModel, KioskModelViewMode } from '@/features/kioskModels/types';



export const KioskModelPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { models, isLoadingList, handleRefresh } = useKioskModelList();
	const { filteredModels, filters, searchValue, setSearchValue } = useKioskModelFilter(models);
	const { isOpenDetailModal, handleCloseDetailModal, selectedModelId, handlePreviewView } = useKioskModelPreview();
	const { isOpenDeleteModal, handleOpenDeleteModal, handleCloseDeleteModal,
		modelToDelete, handleDelete: handleDeleteKioskModel } = useKioskModelDelete();

	const { breadcrumbs, actions, viewMode, setViewMode } = useKioskModelPageConfig({ handleRefresh });
	useDocumentTitle('nikki.vendingMachine.kioskModels.title');

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				sections={[
					<KioskModelListControlPanel
						actions={actions}
						searchValue={searchValue}
						setSearchValue={setSearchValue}
						filters={filters}
						viewMode={viewMode}
						setViewMode={setViewMode}
					/>,
				]}
				isLoading={isLoadingList}
				isEmpty={!filteredModels?.length && !isLoadingList}
			>
				<KioskModelPageContent
					kioskModels={filteredModels}
					handlePreviewView={handlePreviewView}
					handleDelete={handleOpenDeleteModal}
					viewMode={viewMode}
				/>
			</PageContainer>

			<ConfirmModal
				title={translate('nikki.general.messages.delete_confirm')}
				opened={!!modelToDelete && isOpenDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={() => handleDeleteKioskModel(modelToDelete?.id || '')}
				message={
					<Trans i18nKey='nikki.vendingMachine.kioskModels.messages.delete_confirm'
						values={{ name: modelToDelete?.name || '' }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<KioskModelDetailDrawer
				opened={isOpenDetailModal}
				onClose={handleCloseDetailModal}
				modelId={selectedModelId || ''}
			/>
		</>
	);
};


interface KioskModelListControlPanelProps {
	actions: ControlPanelProps['actions'];
	searchValue: string;
	setSearchValue: (value: string) => void;
	filters: ControlPanelProps['filters'];
	viewMode: KioskModelViewMode;
	setViewMode: (value: KioskModelViewMode) => void;
}


const KioskModelListControlPanel: React.FC<KioskModelListControlPanelProps> = ({
	actions, searchValue, setSearchValue, filters, viewMode, setViewMode,
}) => {
	const { t: translate } = useTranslation();
	return (
		<ControlPanel
			actions={actions}
			search={{
				value: searchValue,
				onChange: setSearchValue,
				placeholder: translate('nikki.vendingMachine.kioskModels.search.placeholder'),
			}}
			filters={filters}
			viewMode={{
				value: viewMode,
				onChange: (mode: ViewMode) => setViewMode(mode as KioskModelViewMode),
				segments: ['list', 'grid'],
			}}
		/>
	);
};

type KioskModelPageContentProps = {
	kioskModels: KioskModel[];
	handlePreviewView: (model: KioskModel) => void;
	handleDelete: (model: KioskModel) => void;
	viewMode: KioskModelViewMode;
};
const KioskModelPageContent: React.FC<KioskModelPageContentProps> = ({
	kioskModels, handlePreviewView, handleDelete, viewMode,
}) => {
	const kioskModelListView = useMemo(() => (
		<KioskModelTable
			columns={['referenceCode', 'name', 'description', 'status', 'actions']}
			data={kioskModels as unknown as Record<string, unknown>[]}
			schema={kioskModelSchema as ModelSchema}
			onPreviewView={handlePreviewView}
			onDelete={handleDelete}
		/>
	), [kioskModels, handlePreviewView, handleDelete]);

	const kioskModelGridView = useMemo(() => (
		<KioskModelGridView
			models={kioskModels}
			onPreviewView={handlePreviewView}
			onDelete={handleDelete}
		/>
	), [kioskModels, handlePreviewView, handleDelete]);

	const pageContent = useMemo(() => {
		const views: Partial<Record<ViewMode, React.ReactNode>> = {
			list: kioskModelListView,
			grid: kioskModelGridView,
		};
		return views[viewMode] || kioskModelListView;
	}, [viewMode, kioskModelListView, kioskModelGridView]);

	return pageContent;
};

const useKioskModelFilter = (models: KioskModel[]) => {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const filteredModels = useMemo(() => {
		let filtered = models || [];

		if (statusFilter.length > 0) {
			filtered = filtered.filter((m: KioskModel) => statusFilter.includes(m.status));
		}

		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(m: KioskModel) =>
					(m.referenceCode || '').toLowerCase().includes(searchLower) ||
					m.name.toLowerCase().includes(searchLower),
			) as KioskModel[];
		}

		return filtered;
	}, [models, statusFilter, searchValue]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: 'active', label: translate('nikki.general.status.active') },
				{ value: 'inactive', label: translate('nikki.general.status.inactive') },
			],
			placeholder: translate('nikki.vendingMachine.kioskModels.filter.status'),
		},
	], [statusFilter, translate]);

	return {
		filteredModels,
		filters,
		searchValue,
		setSearchValue,
		statusFilter,
		setStatusFilter,
	};
};