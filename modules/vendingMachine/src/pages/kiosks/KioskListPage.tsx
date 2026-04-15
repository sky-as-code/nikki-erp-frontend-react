import { ConfirmModal } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ControlPanel, ViewMode } from '@/components';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskDetailDrawer, useKioskList, useKioskPageConfig,
	useKioskPreview, KioskListViewMode, kioskSchema, KioskTable,
	KioskGridView, KioskMapView, Kiosk, useKioskArchive,
} from '@/features/kiosks';
import { useKioskFilter } from '@/features/kiosks/hooks/useKioskFilter';


export const KioskListPage: React.FC = () => {
	const { t: translate } = useTranslation();

	const { filters, graph } = useKioskFilter();
	const {
		kiosks, isInitialLoading, isFetching, handleRefresh,
		totalItems, page, pageSize, totalPages, handlePageChange, handlePageSizeChange,
	} = useKioskList({ graph });

	const { isOpenPreview, handlePreview, handleClosePreview, selectedKiosk, isLoadingPreview } = useKioskPreview();

	const {
		isOpenArchiveModal, handleOpenArchiveModal, handleOpenRestoreModal,
		handleCloseModal: handleCloseArchiveModal, pendingArchive, handleConfirmArchive,
	} = useKioskArchive({ onArchiveSuccess: handleRefresh });

	const { breadcrumbs, actions, viewMode, setViewMode } = useKioskPageConfig({ handleRefresh });

	return (
		<React.Fragment key='kiosk-list-page'>
			<PageContainer
				documentTitle={translate('nikki.vendingMachine.kiosk.title')}
				breadcrumbs={breadcrumbs}
				sections={[
					<KioskListControlPanel
						key='kiosk-list-control-panel'
						actions={actions}
						filters={filters}
						viewMode={viewMode}
						setViewMode={setViewMode}
					/>,
				]}
				isLoading={isInitialLoading}
				isEmpty={!kiosks?.length && !isInitialLoading && !isFetching}
			>
				<KioskListPageContent
					kiosks={kiosks}
					viewMode={viewMode}
					handlePreview={handlePreview}
					handleArchive={handleOpenArchiveModal}
					handleRestore={handleOpenRestoreModal}
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
					? translate('nikki.vendingMachine.kiosk.messages.archive_modal_title')
					: translate('nikki.vendingMachine.kiosk.messages.restore_modal_title')}
				opened={!!pendingArchive && isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				message={<Trans
					values={{ name: pendingArchive?.kiosk?.name || '' }}
					components={{ strong: <strong /> }}
					i18nKey={pendingArchive?.targetArchived
						? 'nikki.vendingMachine.kiosk.messages.archive_confirm'
						: 'nikki.vendingMachine.kiosk.messages.restore_confirm'}
				/>}
				confirmLabel={pendingArchive?.targetArchived
					? translate('nikki.general.actions.archive')
					: translate('nikki.general.actions.restore')}
				confirmColor={pendingArchive?.targetArchived ? 'orange' : 'blue'}
			/>

			{
				selectedKiosk && (
					<KioskDetailDrawer
						opened={isOpenPreview}
						onClose={handleClosePreview}
						kiosk={selectedKiosk}
						isLoading={isLoadingPreview}
					/>
				)
			}
		</React.Fragment>
	);
};


interface KioskListControlPanelProps {
	actions: ControlPanelProps['actions'];
	filters: ControlPanelProps['filters'];
	viewMode: KioskListViewMode;
	setViewMode: (value: KioskListViewMode) => void;
}

const KioskListControlPanel: React.FC<KioskListControlPanelProps> = ({
	actions, filters, viewMode, setViewMode,
}) => {
	return (
		<ControlPanel
			actions={actions}
			filters={filters}
			viewMode={{
				value: viewMode,
				onChange: (mode: ViewMode) => setViewMode(mode as KioskListViewMode),
				segments: ['list', 'grid', 'map'],
			}}
		/>
	);
};


const KIOSK_COLUMNS = ['code', 'name', 'connectionStatus', 'locationAddress', 'isArchived', 'mode', 'warnings', 'actions'];

interface KioskListPageContentProps {
	kiosks: Kiosk[];
	viewMode: KioskListViewMode;
	handlePreview: (kiosk: Kiosk) => void;
	handleDelete?: (kiosk: Kiosk) => void;
	handleArchive?: (kiosk: Kiosk) => void;
	handleRestore?: (kiosk: Kiosk) => void;
	isFetching: boolean;
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (value: string | null) => void;
}
const KioskListPageContent: React.FC<KioskListPageContentProps> = ({
	kiosks, viewMode, handlePreview, handleArchive, handleRestore,
	isFetching, page, pageSize, totalPages, totalItems, onPageChange, onPageSizeChange,
}) => {
	const kioskListView = useMemo(() => (
		<KioskTable
			columns={KIOSK_COLUMNS}
			data={kiosks as unknown as Record<string, unknown>[]}
			schema={kioskSchema as ModelSchema}
			onPreview={handlePreview}
			onArchive={handleArchive}
			onRestore={handleRestore}
			isFetching={isFetching}
			totalItems={totalItems}
			page={page}
			pageSize={pageSize}
			totalPages={totalPages}
			onPageChange={onPageChange}
			onPageSizeChange={onPageSizeChange}
		/>
	), [
		kiosks, handlePreview, handleArchive, handleRestore, isFetching,
		page, pageSize, totalPages, onPageChange, onPageSizeChange,
	]);

	const kioskGridView = useMemo(() => (
		<KioskGridView
			kiosks={kiosks}
			onPreview={handlePreview}
			onArchive={handleArchive}
			onRestore={handleRestore}
		/>
	), [kiosks, handlePreview, handleArchive, handleRestore]);

	const kioskMapView = useMemo(() => (
		<KioskMapView kiosks={kiosks} />
	), [kiosks]);

	const pageContent = useMemo(() => {
		const views: Partial<Record<ViewMode, React.ReactNode>> = {
			list: kioskListView,
			grid: kioskGridView,
			map: kioskMapView,
		};
		return views[viewMode] ?? kioskListView;
	}, [viewMode, kioskListView, kioskGridView, kioskMapView]);

	return pageContent;
};
