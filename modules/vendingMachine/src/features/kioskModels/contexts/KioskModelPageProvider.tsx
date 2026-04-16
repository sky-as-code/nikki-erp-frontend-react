import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelActionItem } from '@/components/ControlPanel';

import { useKioskModelArchive } from '../hooks/useKioskModelArchive';
import { useKioskModelDelete } from '../hooks/useKioskModelDelete';
import { useKioskModelFilter, useKioskModelList } from '../hooks/useKioskModelList';
import { useKioskModelPreview } from '../hooks/useKioskModelPreview';
import { KioskModelViewMode } from '../types';



type KioskModelPageContextValue = {
	filter: ReturnType<typeof useKioskModelFilter>;
	list: ReturnType<typeof useKioskModelList>;
	deleteModel: ReturnType<typeof useKioskModelDelete>;
	archiveModel: ReturnType<typeof useKioskModelArchive>;
	previewModel: ReturnType<typeof useKioskModelPreview>;
};

const KioskModelPageContext = createContext<KioskModelPageContextValue | null>(null);

export type KioskModelPageProviderProps = React.PropsWithChildren;

export function KioskModelPageProvider(props: KioskModelPageProviderProps) {
	const filter = useKioskModelFilter();
	const list = useKioskModelList(filter.graph);
	const deleteModel = useKioskModelDelete({ onDeleteSuccess: list.handleRefresh });
	const archiveModel = useKioskModelArchive({ onArchiveSuccess: list.handleRefresh });
	const previewModel = useKioskModelPreview();

	const contextValue: KioskModelPageContextValue = useMemo(
		() => ({ filter, list, deleteModel, archiveModel, previewModel }),
		[filter, list, deleteModel, archiveModel, previewModel],
	);

	return (
		<KioskModelPageContext.Provider value={contextValue}>
			{props.children}
		</KioskModelPageContext.Provider>
	);
}

export function useKioskModelPageContext() {
	const context = useContext(KioskModelPageContext);
	if (!context) {
		throw new Error('useKioskModelPageContext must be used within KioskModelPageProvider');
	}
	return context;
}

export interface UseKioskModelPageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelActionItem[];
	viewModeConfig: {
		value: KioskModelViewMode;
		onChange: (mode: KioskModelViewMode) => void;
		segments: KioskModelViewMode[];
	};
}

export function useKioskModelPageConfig(): UseKioskModelPageConfigReturn {
	const { list: { handleRefresh } } = useKioskModelPageContext();

	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const [viewMode, setViewMode] = useState<KioskModelViewMode>('list');

	const handleCreate = () => {
		navigate('create');
	};

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
			{ title: translate('nikki.vendingMachine.kioskModels.title'), href: '#' },
		],
		[translate],
	);

	const actions = useMemo(
		() => [
			{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
			{
				label: translate('nikki.general.actions.refresh'),
				leftSection: <IconRefresh size={16} />,
				onClick: handleRefresh,
				variant: 'outline' as const,
			},
		],
		[handleRefresh, translate],
	);

	const viewModeConfig: UseKioskModelPageConfigReturn['viewModeConfig'] = useMemo(
		() => ({
			value: viewMode,
			onChange: (mode) => setViewMode(mode),
			segments: ['list', 'grid'],
		}),
		[viewMode],
	);

	return {
		breadcrumbs,
		actions,
		viewModeConfig,
	};
}

export function useKioskModelPageActions() {
	const context = useKioskModelPageContext();
	return {
		delete: context.deleteModel,
		archive: context.archiveModel,
		preview: context.previewModel,
	};
}
