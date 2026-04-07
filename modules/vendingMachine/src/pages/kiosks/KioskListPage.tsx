import { ConfirmModal } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ControlPanel, ControlPanelActionItem } from '@/components';
import { ControlPanelProps, ViewMode } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskDetailDrawer,
	useKioskDelete,
	useKioskFilter,
	useKioskList,
	useKioskPageConfig,
	useKioskPreview,
	KioskListViewMode,
	kioskSchema,
	KioskTable,
	KioskGridView,
	KioskMapView,
	Kiosk,
} from '@/features/kiosks';


export const KioskListPage: React.FC = () => {
	const { t: translate } = useTranslation();

	const {
		kiosks = [], isInitialLoading, isFetching, handleRefresh,
		page, pageSize, totalPages, handlePageChange, handlePageSizeChange,
	} = useKioskList();

	const { filteredKiosks, filters, searchValue, setSearchValue } = useKioskFilter(kiosks);

	const { isOpenPreview, handlePreview, handleClosePreview, selectedKiosk, isLoadingPreview } = useKioskPreview();

	const { isOpenDeleteModal, openDeleteModal, closeDeleteModal, kioskToDelete, handleDelete } = useKioskDelete();

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
						searchValue={searchValue}
						setSearchValue={setSearchValue}
						filters={filters}
						viewMode={viewMode}
						setViewMode={setViewMode}
					/>,
				]}
				isLoading={isInitialLoading}
				isEmpty={!filteredKiosks?.length && !isInitialLoading && !isFetching}
			>
				<KioskListPageContent
					kiosks={filteredKiosks}
					viewMode={viewMode}
					handlePreview={handlePreview}
					handleDelete={openDeleteModal}
					isFetching={isFetching}
					page={page}
					pageSize={pageSize}
					totalPages={totalPages}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
				/>
			</PageContainer>

			<ConfirmModal
				title={translate('nikki.general.messages.delete_confirm')}
				opened={!!kioskToDelete && isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={handleDelete}
				message={<Trans i18nKey='nikki.vendingMachine.kiosk.messages.delete_confirm'
					values={{ name: kioskToDelete?.name || '' }}
					components={{ strong: <strong /> }}
				/>}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<KioskDetailDrawer
				opened={isOpenPreview}
				onClose={handleClosePreview}
				kiosk={selectedKiosk}
				isLoading={isLoadingPreview}
			/>
		</React.Fragment>
	);
};


interface KioskListControlPanelProps {
	actions: ControlPanelActionItem[];
	viewMode: KioskListViewMode;
	setViewMode: (value: KioskListViewMode) => void;
	//
	searchValue: string;
	setSearchValue: (value: string) => void;
	filters: ControlPanelProps['filters'];
}
const KioskListControlPanel: React.FC<KioskListControlPanelProps> =
	({ actions, searchValue, setSearchValue, filters, viewMode, setViewMode }) => {
		const { t: translate } = useTranslation();
		return (
			<ControlPanel
				key='control-panel'
				actions={actions}
				search={{
					value: searchValue,
					onChange: setSearchValue,
					placeholder: translate('nikki.vendingMachine.kiosk.search.placeholder'),
				}}
				filters={filters}
				viewMode={{
					value: viewMode,
					onChange: (mode: ViewMode) => setViewMode(mode as KioskListViewMode),
					segments: ['list', 'grid', 'map'],
				}}
			/>
		);
	};


const KIOSK_COLUMNS = ['code', 'name', 'connectionStatus', 'address', 'status', 'mode', 'warnings', 'actions'];

interface KioskListPageContentProps {
	kiosks: Kiosk[];
	viewMode: KioskListViewMode;
	handlePreview: (kiosk: Kiosk) => void;
	handleDelete: (kiosk: Kiosk) => void;
	isFetching: boolean;
	page: number;
	pageSize: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (value: string | null) => void;
}
const KioskListPageContent: React.FC<KioskListPageContentProps> = ({
	kiosks, viewMode, handlePreview, handleDelete,
	isFetching, page, pageSize, totalPages, onPageChange, onPageSizeChange,
}) => {
	const kioskListView = useMemo(() => (
		<KioskTable
			columns={KIOSK_COLUMNS}
			data={kiosks as unknown as Record<string, unknown>[]}
			schema={kioskSchema as ModelSchema}
			onPreview={handlePreview}
			onDelete={handleDelete}
			isFetching={isFetching}
			page={page}
			pageSize={pageSize}
			totalPages={totalPages}
			onPageChange={onPageChange}
			onPageSizeChange={onPageSizeChange}
		/>
	), [
		kiosks, handlePreview, handleDelete, isFetching,
		page, pageSize, totalPages, onPageChange, onPageSizeChange,
	]);

	const kioskGridView = useMemo(() => (
		<KioskGridView
			kiosks={kiosks}
			onPreview={handlePreview}
			onDelete={handleDelete}
		/>
	), [kiosks, handlePreview, handleDelete]);

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