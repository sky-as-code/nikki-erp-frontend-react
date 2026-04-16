import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelActionItem } from '@/components/ControlPanel';
import { KioskListViewMode, useKioskArchive, useKioskDelete, useKioskPreview } from '@/features/kiosks';
import { useKioskFilter } from '@/features/kiosks/hooks/useKioskFilter';
import { useKioskList } from '@/features/kiosks/hooks/useKioskList';


type KioskListPageContextValue = {
	filter: ReturnType<typeof useKioskFilter>;
	list: ReturnType<typeof useKioskList>;
	deleteKiosk: ReturnType<typeof useKioskDelete>;
	archiveKiosk: ReturnType<typeof useKioskArchive>;
	previewKiosk: ReturnType<typeof useKioskPreview>;
};
const KioskListPageContext = createContext<KioskListPageContextValue | null>(null);

export type KioskListPageProviderProps = React.PropsWithChildren & {
	//
};

export function KioskListPageProvider(props: KioskListPageProviderProps) {
	const filter = useKioskFilter();
	const list = useKioskList({ graph: filter.graph });
	const deleteKiosk = useKioskDelete({ onSuccess: list.handleRefresh });
	const archiveKiosk = useKioskArchive({ onSuccess: list.handleRefresh });
	const previewKiosk = useKioskPreview();

	const contextValue: KioskListPageContextValue = useMemo(() => {
		return {
			filter,
			list,
			deleteKiosk,
			archiveKiosk,
			previewKiosk,
		};
	}, [filter, list, deleteKiosk, archiveKiosk, previewKiosk]);

	return (
		<KioskListPageContext.Provider value={contextValue}>
			{props.children}
		</KioskListPageContext.Provider>
	);
}

export function useKioskListPageContext() {
	const context = useContext<KioskListPageContextValue | null>(KioskListPageContext);
	if (!context) throw new Error('useKioskListPageContext must be used within KioskListPageProvider');
	return context;
}


export interface UseKioskListPageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelActionItem[];
	viewModeConfig: {
		value: KioskListViewMode;
		onChange: (mode: KioskListViewMode) => void;
		segments: KioskListViewMode[];
	};
}
export function useKioskListPageConfig(): UseKioskListPageConfigReturn {
	const context = useKioskListPageContext();
	if (!context) throw new Error('useKioskListPageLayout must be used within KioskListPageProvider');

	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const [viewMode, setViewMode] = useState<KioskListViewMode>('list');

	const { handleRefresh } = context.list;

	const handleCreate = () => {
		navigate('../kiosks/create');
	};

	const breadcrumbs = useMemo(() => {
		return [
			{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
			{ title: translate('nikki.vendingMachine.kiosk.title'), href: '#' },
		];
	}, [translate]);

	const actions = useMemo(() => [
		{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
		{ label: translate('nikki.general.actions.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' as const },
	], [handleRefresh, translate]);

	const viewModeConfig: UseKioskListPageConfigReturn['viewModeConfig'] = useMemo(() => {
		return {
			value: viewMode,
			onChange: (mode) => setViewMode(mode),
			segments: ['list', 'grid', 'map'],
		};
	}, [viewMode, setViewMode]);

	return {
		breadcrumbs,
		actions,
		viewModeConfig,
	};
}

export const useKioskListPageActions = () => {
	const context = useKioskListPageContext();
	if (!context) throw new Error('useKioskListPageActions must be used within KioskListPageProvider');
	return {
		delete: context.deleteKiosk,
		archive: context.archiveKiosk,
		preview: context.previewKiosk,
	};
};
