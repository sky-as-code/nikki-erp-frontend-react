import { TablePaginationProps } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel } from '@/components';
import { ControlPanelViewModeProps } from '@/components/ControlPanel/ControlPanelViewMode';
import { PageContainer } from '@/components/PageContainer';
import {
	ArchiveKioskModal,
	DeleteKioskModal,
	KioskDetailDrawer,
	KioskListViewMode, kioskSchema, KioskTable,
	KioskGridView, KioskMapView, Kiosk,
	KioskTableActions,
} from '@/features/kiosks';
import {
	KioskListPageProvider,
	useKioskListPageActions,
	useKioskListPageContext,
	useKioskListPageConfig,
} from '@/features/kiosks/contexts/KioskListPageProvider';


export const KioskListPage: React.FC = () => {
	return (
		<KioskListPageProvider>
			<KioskListPageContent />
		</KioskListPageProvider>
	);
};

export const KioskListPageContent: React.FC = () => {
	const { t: translate } = useTranslation();
	const { filter, list: { kiosks, pagination, isLoading, isEmpty } } = useKioskListPageContext();
	const { breadcrumbs, actions, viewModeConfig } = useKioskListPageConfig();
	const { preview, delete: deleteKiosk, archive } = useKioskListPageActions();

	const kioskTableActions: KioskTableActions = {
		view: preview.handlePreview,
		archive: archive.handleOpenArchiveModal,
		restore: archive.handleOpenRestoreModal,
		delete: deleteKiosk.openDeleteModal,
	};

	return <PageContainer
		isLoading={isLoading}
		isEmpty={isEmpty}
		breadcrumbs={breadcrumbs}
		sections={[
			<ControlPanel
				actions={actions}
				filters={filter.filters}
				viewMode={viewModeConfig as ControlPanelViewModeProps}
			/>,
		]}
		documentTitle={translate('nikki.vendingMachine.kiosk.title')}
	>
		<KioskList
			isLoading={isLoading}
			kiosks={kiosks}
			pagination={pagination}
			viewMode={viewModeConfig.value}
			actions={kioskTableActions}
		/>
		<DeleteKioskModal
			opened={!!deleteKiosk.kioskToDelete && deleteKiosk.isOpenDeleteModal}
			onClose={deleteKiosk.closeDeleteModal}
			onConfirm={deleteKiosk.handleDelete}
			name={deleteKiosk.kioskToDelete?.name || ''}
		/>
		<ArchiveKioskModal
			opened={!!archive.pendingArchive && archive.isOpenArchiveModal}
			onClose={archive.handleCloseModal}
			onConfirm={archive.handleConfirmArchive}
			type={archive.pendingArchive?.targetArchived ? 'archive' : 'restore'}
			name={archive.pendingArchive?.kiosk?.name ?? ''}
		/>
		<KioskPreview />
	</PageContainer>;
};


const KioskPreview = () => {
	const { preview } = useKioskListPageActions();

	if (!preview.selectedKiosk) return null;

	return (
		<KioskDetailDrawer
			opened={preview.isOpenPreview}
			onClose={preview.handleClosePreview}
			kiosk={preview.selectedKiosk}
			isLoading={preview.isLoadingPreview}
		/>
	);
};

interface KioskListPageContentProps {
	isLoading: boolean;
	kiosks: Kiosk[];
	pagination: TablePaginationProps;
	viewMode: KioskListViewMode;
	actions: KioskTableActions;
}
const KioskList: React.FC<KioskListPageContentProps> = ({ isLoading, kiosks, pagination, viewMode, actions }) => {
	const tableColumns = [
		'name', 'code', 'connectionStatus', 'locationAddress',
		'isArchived', 'mode', 'warnings', 'actions',
	];

	switch (viewMode) {
		case 'grid':
			return (
				<KioskGridView
					kiosks={kiosks}
					actions={actions}
					pagination={pagination}
				/>
			);
		case 'map':
			return <KioskMapView kiosks={kiosks} />;
		case 'list':
		default:
			return (
				<KioskTable
					isLoading={isLoading}
					columns={tableColumns}
					data={kiosks as unknown as Record<string, unknown>[]}
					schema={kioskSchema as ModelSchema}
					actions={actions}
					pagination={pagination}
				/>
			);
	}
};
