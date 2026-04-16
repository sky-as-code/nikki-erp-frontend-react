import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


import { usePaymentArchived } from '../hooks/usePaymentArchived';
import { usePaymentDelete } from '../hooks/usePaymentDelete';
import { usePaymentFilter } from '../hooks/usePaymentFilter';
import { usePaymentList } from '../hooks/usePaymentList';
import { usePaymentPreview } from '../hooks/usePaymentPreview';

import type { ViewMode } from '@/components/ControlPanel/types';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelActionItem } from '@/components/ControlPanel';


export type PaymentListViewMode = Extract<ViewMode, 'list' | 'grid'>;

type PaymentListPageContextValue = {
	filter: ReturnType<typeof usePaymentFilter>;
	list: ReturnType<typeof usePaymentList>;
	deletePayment: ReturnType<typeof usePaymentDelete>;
	archivePayment: ReturnType<typeof usePaymentArchived>;
	previewPayment: ReturnType<typeof usePaymentPreview>;
};

const PaymentListPageContext = createContext<PaymentListPageContextValue | null>(null);

export function PaymentListPageProvider(props: React.PropsWithChildren) {
	const filter = usePaymentFilter();
	const list = usePaymentList(filter.graph);
	const deletePayment = usePaymentDelete({ onDeleteSuccess: list.handleRefresh });
	const archivePayment = usePaymentArchived({ onArchiveSuccess: list.handleRefresh });
	const previewPayment = usePaymentPreview();

	const contextValue = useMemo<PaymentListPageContextValue>(
		() => ({ filter, list, deletePayment, archivePayment, previewPayment }),
		[filter, list, deletePayment, archivePayment, previewPayment],
	);

	return (
		<PaymentListPageContext.Provider value={contextValue}>
			{props.children}
		</PaymentListPageContext.Provider>
	);
}

export function usePaymentListPageContext() {
	const context = useContext(PaymentListPageContext);
	if (!context) {
		throw new Error('usePaymentListPageContext must be used within PaymentListPageProvider');
	}
	return context;
}

export interface UsePaymentListPageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelActionItem[];
	viewModeConfig: {
		value: PaymentListViewMode;
		onChange: (mode: PaymentListViewMode) => void;
		segments: PaymentListViewMode[];
	};
}

export function usePaymentListPageConfig(): UsePaymentListPageConfigReturn {
	const { list: { handleRefresh } } = usePaymentListPageContext();

	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const [viewMode, setViewMode] = useState<PaymentListViewMode>('list');

	const handleCreate = () => {
		navigate('create');
	};

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
			{ title: translate('nikki.vendingMachine.payment.title'), href: '#' },
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

	const viewModeConfig: UsePaymentListPageConfigReturn['viewModeConfig'] = useMemo(
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

export function usePaymentListPageActions() {
	const context = usePaymentListPageContext();
	return {
		delete: context.deletePayment,
		archive: context.archivePayment,
		preview: context.previewPayment,
	};
}
