import { ConfirmModal } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ControlPanel, ViewMode } from '@/components';
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
	const {
		filters, models, isInitialLoading, isFetching, handleRefresh,
		page, pageSize, totalPages, totalItems, handlePageChange, handlePageSizeChange,
	} = useKioskModelList();

	const {
		isOpenDetailModal, handleCloseDetailModal,
		selectedModelId, handlePreviewView,
	} = useKioskModelPreview();

	const {
		isOpenDeleteModal,
		handleOpenDeleteModal, handleCloseDeleteModal,
		modelToDelete, handleDelete: handleDeleteKioskModel,
	} = useKioskModelDelete({ onDeleteSuccess: handleRefresh });

	const { breadcrumbs, actions, viewMode, setViewMode } = useKioskModelPageConfig({ handleRefresh });

	return (
		<>
			<PageContainer
				documentTitle={translate('nikki.vendingMachine.kioskModels.title')}
				breadcrumbs={breadcrumbs}
				sections={[
					<KioskModelListControlPanel
						actions={actions}
						filters={filters}
						viewMode={viewMode}
						setViewMode={setViewMode}
					/>,
				]}
				isLoading={isInitialLoading}
			>
				<KioskModelPageContent
					kioskModels={models}
					handlePreviewView={handlePreviewView}
					handleDelete={handleOpenDeleteModal}
					viewMode={viewMode}
					isFetching={isFetching}
					page={page}
					pageSize={pageSize}
					totalPages={totalPages}
					totalItems={totalItems}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
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
	filters: ControlPanelProps['filters'];
	viewMode: KioskModelViewMode;
	setViewMode: (value: KioskModelViewMode) => void;
}


const KioskModelListControlPanel: React.FC<KioskModelListControlPanelProps> = ({
	actions, filters, viewMode, setViewMode,
}) => {
	return (
		<ControlPanel
			actions={actions}
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
	isFetching: boolean;
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (value: string | null) => void;
};
const KioskModelPageContent: React.FC<KioskModelPageContentProps> = ({
	kioskModels, handlePreviewView, handleDelete, viewMode,
	isFetching, page, pageSize, totalPages, totalItems, onPageChange, onPageSizeChange,
}) => {
	const kioskModelListView = useMemo(() => (
		<KioskModelTable
			columns={['modelId', 'referenceCode', 'name', 'description', 'status', 'actions']}
			data={kioskModels as unknown as Record<string, unknown>[]}
			schema={kioskModelSchema as ModelSchema}
			onPreviewView={handlePreviewView}
			onDelete={handleDelete}
			isFetching={isFetching}
			page={page}
			pageSize={pageSize}
			totalPages={totalPages}
			totalItems={totalItems}
			onPageChange={onPageChange}
			onPageSizeChange={onPageSizeChange}
		/>
	), [
		kioskModels, handlePreviewView, handleDelete, isFetching,
		page, pageSize, totalPages, onPageChange, onPageSizeChange,
	]);

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
