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
	KioskModelTable,
	useKioskModelArchive,
	useKioskModelFilter,
	useKioskModelList,
	useKioskModelPageConfig,
	useKioskModelPreview,
} from '@/features/kioskModels';
import { kioskModelSchema } from '@/features/kioskModels/schemas';
import { KioskModel, KioskModelViewMode } from '@/features/kioskModels/types';


export const KioskModelPage: React.FC = () => {
	const { t: translate } = useTranslation();

	const { filters, graph } = useKioskModelFilter();
	const {
		models, isInitialLoading, isFetching, handleRefresh,
		page, pageSize, totalPages, totalItems, handlePageChange, handlePageSizeChange,
	} = useKioskModelList(graph);

	const { isOpenDetailModal, handleCloseDetailModal, selectedModelId, handlePreview } = useKioskModelPreview();

	const {
		isOpenArchiveModal,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal: handleCloseArchiveModal,
		pendingArchive,
		handleConfirmArchive,
	} = useKioskModelArchive({ onArchiveSuccess: handleRefresh });

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
					handlePreview={handlePreview}
					handleArchive={handleOpenArchiveModal}
					handleRestore={handleOpenRestoreModal}
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
				title={pendingArchive?.targetArchived
					? translate('nikki.vendingMachine.kioskModels.messages.archive_modal_title')
					: translate('nikki.vendingMachine.kioskModels.messages.restore_modal_title')}
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				message={
					<Trans
						i18nKey={pendingArchive?.targetArchived
							? 'nikki.vendingMachine.kioskModels.messages.archive_confirm'
							: 'nikki.vendingMachine.kioskModels.messages.restore_confirm'}
						values={{ name: pendingArchive?.model.name || '' }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={pendingArchive?.targetArchived
					? translate('nikki.general.actions.archive')
					: translate('nikki.general.actions.restore')}
				confirmColor={pendingArchive?.targetArchived ? 'orange' : 'blue'}
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
	handlePreview: (model: KioskModel) => void;
	handleArchive: (model: KioskModel) => void;
	handleRestore: (model: KioskModel) => void;
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
	kioskModels, handlePreview, handleArchive, handleRestore, viewMode,
	isFetching, page, pageSize, totalPages, totalItems, onPageChange, onPageSizeChange,
}) => {
	const kioskModelListView = useMemo(() => (
		<KioskModelTable
			columns={['modelId', 'referenceCode', 'name', 'description', 'status', 'actions']}
			data={kioskModels as unknown as Record<string, unknown>[]}
			schema={kioskModelSchema as ModelSchema}
			onPreview={handlePreview}
			onArchive={handleArchive}
			onRestore={handleRestore}
			isFetching={isFetching}
			page={page}
			pageSize={pageSize}
			totalPages={totalPages}
			totalItems={totalItems}
			onPageChange={onPageChange}
			onPageSizeChange={onPageSizeChange}
		/>
	), [
		kioskModels, handlePreview, handleArchive, handleRestore, isFetching,
		page, pageSize, totalPages, totalItems, onPageChange, onPageSizeChange,
	]);

	const kioskModelGridView = useMemo(() => (
		<KioskModelGridView
			models={kioskModels}
			onPreview={handlePreview}
			onArchive={handleArchive}
			onRestore={handleRestore}
		/>
	), [kioskModels, handlePreview, handleArchive, handleRestore]);

	const pageContent = useMemo(() => {
		const views: Partial<Record<ViewMode, React.ReactNode>> = {
			list: kioskModelListView,
			grid: kioskModelGridView,
		};
		return views[viewMode] || kioskModelListView;
	}, [viewMode, kioskModelListView, kioskModelGridView]);

	return pageContent;
};
