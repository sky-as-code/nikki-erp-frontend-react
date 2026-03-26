import { ConfirmModal } from '@nikkierp/ui/components';
import { useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ControlPanel } from '@/components';
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
	const { kiosks = [], isLoadingList, handleRefresh } = useKioskList();

	const { filteredKiosks, filters, searchValue, setSearchValue } = useKioskFilter(kiosks);

	const { isOpenPreview, handlePreview, handleClosePreview, selectedKiosk, isLoadingPreview } = useKioskPreview();

	const { isOpenDeleteModal, handleOpenDeleteModal, handleCloseDeleteModal,
		kioskToDelete, handleDelete: handleDeleteKiosk } = useKioskDelete(handleRefresh);

	const { breadcrumbs, actions, viewMode, setViewMode } = useKioskPageConfig({ handleRefresh });

	useDocumentTitle('nikki.vendingMachine.kiosk.title');

	return (
		<>
			<PageContainer
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
				isLoading={isLoadingList}
				isEmpty={!filteredKiosks?.length && !isLoadingList}
			>
				<KioskListPageContent
					kiosks={filteredKiosks}
					isLoading={isLoadingList}
					viewMode={viewMode}
					handlePreview={handlePreview}
					handleDelete={handleOpenDeleteModal}
				/>
			</PageContainer>

			<ConfirmModal
				title={translate('nikki.general.messages.delete_confirm')}
				opened={!!kioskToDelete && isOpenDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={() => handleDeleteKiosk(kioskToDelete?.id || '')}
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
		</>
	);
};


interface KioskListControlPanelProps {
	actions: ControlPanelProps['actions'];
	searchValue: string;
	setSearchValue: (value: string) => void;
	filters: ControlPanelProps['filters'];
	viewMode: KioskListViewMode;
	setViewMode: (value: KioskListViewMode) => void;
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



interface KioskListPageContentProps {
	kiosks: Kiosk[];
	isLoading: boolean;
	viewMode: KioskListViewMode;
	handlePreview: (kiosk: Kiosk) => void;
	handleDelete: (kiosk: Kiosk) => void;
}
const KioskListPageContent: React.FC<KioskListPageContentProps> =
	({ kiosks, isLoading, viewMode, handlePreview, handleDelete }) => {
		const kioskListView = useMemo(() => (
			<KioskTable
				columns={['code', 'name', 'connectionStatus', 'address', 'status', 'mode', 'warnings', 'actions']}
				data={kiosks as unknown as Record<string, unknown>[]}
				schema={kioskSchema as ModelSchema}
				isLoading={isLoading}
				onPreview={handlePreview}
				onDelete={handleDelete}
			/>
		), [kiosks, handlePreview, handleDelete, isLoading]);

		const kioskGridView = useMemo(() => (
			<KioskGridView
				kiosks={kiosks}
				isLoading={isLoading}
				onPreview={handlePreview}
				onDelete={handleDelete}
			/>
		), [kiosks, handlePreview, handleDelete, isLoading]);

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