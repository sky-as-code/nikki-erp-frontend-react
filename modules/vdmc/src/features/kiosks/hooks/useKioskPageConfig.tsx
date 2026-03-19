
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { KioskListViewMode } from '../components';


export type BreadcrumbItem = { title: string; href: string };
export type PageAction = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	label: string;
	leftSection?: React.ReactNode;
	onClick?: () => void;
	variant?: 'filled' | 'outline' | 'light' | 'subtle' | 'default' | 'gradient';
} | null;

export interface UseKioskPageConfigOptions {
	handleRefresh: () => void;
	backendActions?: PageAction[];
	breadcrumbsConfig?: BreadcrumbItem[];
}

export interface UseKioskPageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: PageAction[];
	viewMode: KioskListViewMode;
	setViewMode: (mode: KioskListViewMode) => void;
}

export const useKioskPageConfig = ({
	handleRefresh,
	backendActions = [],
	breadcrumbsConfig,
}: UseKioskPageConfigOptions): UseKioskPageConfigReturn => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const [viewMode, setViewMode] = useState<KioskListViewMode>('list');

	const handleCreate = () => {
		navigate('/kiosks/create');
	};

	const breadcrumbs = useMemo(() => {
		if (breadcrumbsConfig) {
			return breadcrumbsConfig;
		}
		return [
			{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
			{ title: translate('nikki.vendingMachine.kiosk.title'), href: '#' },
		];
	}, [breadcrumbsConfig, translate]);

	const defaultActions = useMemo(() => [
		{ label: translate('nikki.general.actions.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
		{ label: translate('nikki.general.actions.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' as const },
	], [handleRefresh, translate]);

	const actions = useMemo(() => {
		const mergedActions = [...defaultActions, ...backendActions];
		return mergedActions.filter((action): action is NonNullable<PageAction> => action !== null);
	}, [defaultActions, backendActions]);


	return {
		breadcrumbs,
		actions,
		viewMode,
		setViewMode,
	};
};
