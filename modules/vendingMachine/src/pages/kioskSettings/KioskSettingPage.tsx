import { ConfirmModal } from '@nikkierp/ui/components';
import { useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ControlPanel } from '@/components';
import { ControlPanelProps, ViewMode } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskSettingDetailDrawer,
	KioskSettingGridView,
	KioskSettingTable,
	kioskSettingSchema,
	useKioskSettingDelete,
	useKioskSettingFilter,
	useKioskSettingList,
	useKioskSettingPageConfig,
	useKioskSettingPreview,
	KioskSettingListViewMode,
} from '@/features/kioskSettings';
import { KioskSetting } from '@/features/kioskSettings/types';


export const KioskSettingPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { settings = [], isLoadingList, handleRefresh } = useKioskSettingList();

	const { filteredSettings, filters, searchValue, setSearchValue } = useKioskSettingFilter(settings);

	const { isOpenPreview, handlePreview,
		handleClosePreview, selectedSetting, isLoadingPreview } = useKioskSettingPreview();

	const {
		isOpenDeleteModal,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		settingToDelete,
		handleDelete: handleDeleteSetting,
	} = useKioskSettingDelete(handleRefresh);

	const { breadcrumbs, actions, viewMode, setViewMode } = useKioskSettingPageConfig({ handleRefresh });

	useDocumentTitle('nikki.vendingMachine.kioskSettings.title');

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				sections={[
					<KioskSettingListControlPanel
						key='kiosk-setting-list-control-panel'
						actions={actions}
						searchValue={searchValue}
						setSearchValue={setSearchValue}
						filters={filters}
						viewMode={viewMode}
						setViewMode={setViewMode}
					/>,
				]}
				isLoading={isLoadingList}
				isEmpty={!filteredSettings?.length && !isLoadingList}
			>
				<KioskSettingListPageContent
					settings={filteredSettings}
					isLoading={isLoadingList}
					viewMode={viewMode}
					handlePreview={handlePreview}
					handleDelete={handleOpenDeleteModal}
				/>
			</PageContainer>

			<ConfirmModal
				title={translate('nikki.general.messages.delete_confirm')}
				opened={!!settingToDelete && isOpenDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={() => handleDeleteSetting(settingToDelete?.id || '')}
				message={
					<Trans
						i18nKey='nikki.general.messages.delete_confirm_name'
						values={{ name: settingToDelete?.name || '' }}
					/>
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>

			<KioskSettingDetailDrawer
				opened={isOpenPreview}
				onClose={handleClosePreview}
				setting={selectedSetting}
				isLoading={isLoadingPreview}
			/>
		</>
	);
};


interface KioskSettingListControlPanelProps {
	actions: ControlPanelProps['actions'];
	searchValue: string;
	setSearchValue: (value: string) => void;
	filters: ControlPanelProps['filters'];
	viewMode: KioskSettingListViewMode;
	setViewMode: (value: KioskSettingListViewMode) => void;
}

const KioskSettingListControlPanel: React.FC<KioskSettingListControlPanelProps> =
	({ actions, searchValue, setSearchValue, filters, viewMode, setViewMode }) => {
		const { t: translate } = useTranslation();
		return (
			<ControlPanel
				key='control-panel'
				actions={actions}
				search={{
					value: searchValue,
					onChange: setSearchValue,
					placeholder: translate('nikki.vendingMachine.kioskSettings.search.placeholder'),
				}}
				filters={filters}
				viewMode={{
					value: viewMode,
					onChange: (mode: ViewMode) => setViewMode(mode as KioskSettingListViewMode),
					segments: ['list', 'grid'],
				}}
			/>
		);
	};


interface KioskSettingListPageContentProps {
	settings: KioskSetting[];
	isLoading: boolean;
	viewMode: KioskSettingListViewMode;
	handlePreview: (setting: KioskSetting) => void;
	handleDelete: (setting: KioskSetting) => void;
}

const KioskSettingListPageContent: React.FC<KioskSettingListPageContentProps> =
	({ settings, isLoading, viewMode, handlePreview, handleDelete }) => {
		const kioskSettingListView = useMemo(() => (
			<KioskSettingTable
				columns={['code', 'name', 'description', 'status', 'actions']}
				data={settings as unknown as Record<string, unknown>[]}
				schema={kioskSettingSchema as ModelSchema}
				isLoading={isLoading}
				onPreview={handlePreview}
				onDelete={handleDelete}
			/>
		), [settings, handlePreview, handleDelete, isLoading]);

		const kioskSettingGridView = useMemo(() => (
			<KioskSettingGridView
				settings={settings}
				isLoading={isLoading}
				onPreview={handlePreview}
				onDelete={handleDelete}
			/>
		), [settings, handlePreview, handleDelete, isLoading]);

		const pageContent = useMemo(() => {
			const views: Partial<Record<ViewMode, React.ReactNode>> = {
				list: kioskSettingListView,
				grid: kioskSettingGridView,
			};
			return views[viewMode] ?? kioskSettingListView;
		}, [viewMode, kioskSettingListView, kioskSettingGridView]);

		return pageContent;
	};
