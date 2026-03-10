import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconFileDownloadFilled, IconTrash, IconX } from '@tabler/icons-react';
import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useNavigate } from 'react-router';

import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { PageContainerProps } from '@/components/PageContainer';
import { Kiosk } from '@/features/kiosks';
import { KioskActivity } from '@/features/kiosks/components/KioskDetail/KioskActivity';
import { KioskBasicInfo } from '@/features/kiosks/components/KioskDetail/KioskBasicInfo';
import { KioskSetting } from '@/features/kiosks/components/KioskDetail/KioskSetting';
import { ProductListView } from '@/features/kiosks/components/KioskDetail/ProductListView';
import { StockGridView } from '@/features/kiosks/components/KioskDetail/StockGridView';


// Type cho tab hook return
type TabHookReturn = {
	actions: ControlPanelProps['actions'];
	handlers: Record<string, (...args: any[]) => void>;
	state: Record<string, any>;
	getComponentProps?: () => Record<string, any>;
};

/**
 * Hook quản lý BasicInfo tab
 * Quản lý state isEditing riêng và trả về actions, handlers, state
 */
const useBasicInfoTab = (_kiosk?: Kiosk): TabHookReturn => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		// TODO: Implement save logic
		setIsEditing(false);
	}, []);
	const handleCancel = useCallback(() => setIsEditing(false), []);
	const handleDelete = useCallback(() => {
		// TODO: Implement delete logic
	}, []);

	const actions = useMemo<ControlPanelProps['actions']>(() => {
		return [
			...(!isEditing ? [{
				label: translate('nikki.general.actions.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: handleEdit,
				variant: 'filled' as const,
			}] : [{
				label: translate('nikki.general.actions.save'),
				leftSection: <IconDeviceFloppy size={16} />,
				onClick: handleSave,
				variant: 'filled' as const,
			}, {
				label: translate('nikki.general.actions.cancel'),
				leftSection: <IconX size={16} />,
				onClick: handleCancel,
				variant: 'outline' as const,
			}]),
			{
				label: translate('nikki.general.actions.delete'),
				leftSection: <IconTrash size={16} />,
				onClick: handleDelete,
				variant: 'outline' as const,
				color: 'red' as const,
			},
		];
	}, [isEditing, handleEdit, handleSave, handleCancel, handleDelete, translate]);

	return {
		actions,
		handlers: {
			handleEdit,
			handleSave,
			handleCancel,
			handleDelete,
		},
		state: {
			isEditing,
		},
		getComponentProps: () => ({
			isEditing,
		}),
	};
};

/**
 * Hook quản lý KioskSetting tab
 */
const useKioskSettingTab = (_kiosk?: Kiosk): TabHookReturn => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		// TODO: Implement save logic
		setIsEditing(false);
	}, []);
	const handleCancel = useCallback(() => setIsEditing(false), []);

	const actions = useMemo<ControlPanelProps['actions']>(() => {
		return [
			...(!isEditing ? [{
				label: translate('nikki.general.actions.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: handleEdit,
				variant: 'filled' as const,
			}] : [{
				label: translate('nikki.general.actions.save'),
				leftSection: <IconDeviceFloppy size={16} />,
				onClick: handleSave,
				variant: 'filled' as const,
			}, {
				label: translate('nikki.general.actions.cancel'),
				leftSection: <IconX size={16} />,
				onClick: handleCancel,
				variant: 'outline' as const,
			}]),
		];
	}, [isEditing, handleEdit, handleSave, handleCancel, translate]);

	return {
		actions,
		handlers: {
			setIsEditing,
			handleSave,
			handleCancel,
			handleEdit,
		},
		state: {
			isEditing,
		},
		getComponentProps: () => ({
			isEditing,
		}),
	};
};

/**
 * Hook quản lý ProductsList tab
 */
const useProductsListTab = (_kiosk?: Kiosk): TabHookReturn => {
	return {
		actions: [],
		handlers: {},
		state: {},
		getComponentProps: () => ({}),
	};
};

/**
 * Hook quản lý ProductsGrid tab
 */
const useProductsGridTab = (_kiosk?: Kiosk): TabHookReturn => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = useCallback(() => setIsEditing(true), []);
	const handleSave = useCallback(() => {
		// TODO: Implement save logic
		setIsEditing(false);
	}, []);
	const handleCancel = useCallback(() => setIsEditing(false), []);

	const actions = useMemo<ControlPanelProps['actions']>(() => {
		return [
			...(!isEditing ? [{
				label: translate('nikki.general.actions.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: handleEdit,
				variant: 'filled' as const,
			}] :
				[
					{
						label: translate('nikki.vendingMachine.kiosk.products.actions.loadAll'),
						leftSection: <IconFileDownloadFilled size={16} />,
						onClick: handleSave,
						variant: 'filled' as const,
					},
					{
						label: translate('nikki.general.actions.save'),
						leftSection: <IconDeviceFloppy size={16} />,
						onClick: handleSave,
						variant: 'filled' as const,
					},
					{
						label: translate('nikki.general.actions.cancel'),
						leftSection: <IconX size={16} />,
						onClick: handleCancel,
						variant: 'outline' as const,
					},
				]),
		];
	}, [isEditing, handleEdit, handleSave, handleCancel, translate]);

	return {
		actions,
		handlers: {
			setIsEditing,
		},
		state: {
			isEditing,
		},
		getComponentProps: () => ({
			isEditing,
		}),
	};
};

/**
 * Hook quản lý Activity tab
 */
const useActivityTab = (_kiosk?: Kiosk): TabHookReturn => {
	return {
		actions: [],
		handlers: {},
		state: {},
		getComponentProps: () => ({}),
	};
};

// Memoized components that don't depend on isEditing to prevent unnecessary re-renders
const MemoizedProductListView = React.memo(ProductListView);
const MemoizedKioskActivity = React.memo(KioskActivity);

export type TabId = 'basicInfo' | 'kioskSetting' | 'productsList' | 'productsGrid' | 'activity';

export type UseKioskDetailTabsProps = {
	kiosk?: Kiosk;
	activeTab: TabId;
};

export type UseKioskDetailTabsReturn = {
	tabs: DetailLayoutProps['tabs'];
	getTabActions: (tabId: TabId) => ControlPanelProps['actions'];
	getTabHandlers: (tabId: TabId) => Record<string, (...args: any[]) => void>;
	getTabState: (tabId: TabId) => Record<string, any>;
};

// Helper function để tạo component cho từng tab với props từ hook
const createTabComponent = (
	tabId: TabId,
	componentProps: Record<string, any>,
): React.ReactNode => {
	// const componentProps = tabHook.getComponentProps?.() ?? {};

	switch (tabId) {
		case 'basicInfo': {
			// const { isEditing } = componentProps as { isEditing: boolean };
			return <KioskBasicInfo key='basicInfo' kiosk={componentProps?.kiosk} isEditing={componentProps?.isEditing} {...componentProps} />;
		}
		case 'kioskSetting': {
			// const { isEditing } = componentProps as { isEditing: boolean };
			return <KioskSetting key='kioskSetting' kiosk={componentProps?.kiosk} isEditing={componentProps?.isEditing} {...componentProps} />;
		}
		case 'productsList':
			return <MemoizedProductListView key='productsList' kioskId={componentProps?.kiosk?.id} {...componentProps} />;
		case 'productsGrid': {
			// const { isEditing } = componentProps as { isEditing: boolean };
			return <StockGridView key='stockGrid' kioskId={componentProps?.kiosk?.id} isEditing={componentProps?.isEditing} />;
		}
		case 'activity':
			return <MemoizedKioskActivity key='activity' {...componentProps} />;
		default:
			return null;
	}
};


/**
 * Hook quản lý các tab của kiosk detail
 * - Mỗi tab có hook riêng quản lý actions, handlers và state
 * - Components chỉ được tạo khi tab đó là current tab (lazy loading)
 * - Mỗi tab hook trả về state riêng được truyền vào component
 */
export const useKioskDetailTabs = ({
	kiosk,
	activeTab,
}: UseKioskDetailTabsProps): UseKioskDetailTabsReturn => {
	const { t: translate } = useTranslation();

	// Gọi các hook riêng cho từng tab
	// Mỗi hook quản lý state riêng của tab đó
	const basicInfoTab = useBasicInfoTab(kiosk);
	const kioskSettingTab = useKioskSettingTab(kiosk);
	const productsListTab = useProductsListTab(kiosk);
	const productsGridTab = useProductsGridTab(kiosk);
	const activityTab = useActivityTab(kiosk);

	// Map các tab hooks theo tabId
	const tabHooks = useMemo<Record<TabId, TabHookReturn>>(() => {
		return {
			basicInfo: basicInfoTab,
			kioskSetting: kioskSettingTab,
			productsList: productsListTab,
			productsGrid: productsGridTab,
			activity: activityTab,
		};
	}, [basicInfoTab, kioskSettingTab, productsListTab, productsGridTab, activityTab]);

	// Định nghĩa các tab với lazy loading components
	const tabs = useMemo<DetailLayoutProps['tabs']>(() => {
		if (!kiosk) return [];

		const tabConfigs: Array<{ id: TabId; title: string }> = [
			{ id: 'basicInfo', title: translate('nikki.vendingMachine.kiosk.tabs.basicInfo') },
			{ id: 'kioskSetting', title: translate('nikki.vendingMachine.kiosk.tabs.kioskSetting') },
			{ id: 'productsList', title: translate('nikki.vendingMachine.kiosk.tabs.productsList') },
			{ id: 'productsGrid', title: translate('nikki.vendingMachine.kiosk.tabs.productsGrid') },
			{ id: 'activity', title: translate('nikki.vendingMachine.kiosk.tabs.activity') },
		];

		return tabConfigs.map((config) => {
			const tabHook = tabHooks[config.id];
			const componentProps = tabHook.getComponentProps?.() ?? {};
			return {
				id: config.id,
				title: config.title,
				content: () => {
					// Chỉ tạo component khi tab này là active tab (lazy loading)
					if(config.id !== activeTab) {
						return null;
					}
					// Tạo component với props từ hook của tab đó
					return createTabComponent(config.id, {kiosk, ...componentProps});
				},
			};
		});
	}, [kiosk, activeTab, translate, tabHooks]);

	// Lấy actions cho tab hiện tại
	const navigate = useNavigate();
	const handleGoBack = useCallback(() => {
		const prePath = resolvePath('..', location.pathname).pathname;
		navigate(prePath);
	}, [navigate]);

	const getTabActions = useCallback((tabId: TabId): ControlPanelProps['actions'] => {
		const commonActions = [
			{
				label: translate('nikki.general.actions.back'),
				onClick: handleGoBack,
				leftSection: <IconArrowLeft size={16} />,
				variant: 'outline',
			},
		];

		const tabActions = tabHooks[tabId]?.actions ?? [];

		return [...commonActions, ...tabActions];
	}, [tabHooks]);

	// Lấy handlers cho tab hiện tại
	const getTabHandlers = useCallback((tabId: TabId): Record<string, (...args: any[]) => void> => {
		return tabHooks[tabId]?.handlers ?? {};
	}, [tabHooks]);

	// Lấy state cho tab hiện tại
	const getTabState = useCallback((tabId: TabId): Record<string, any> => {
		return tabHooks[tabId]?.state ?? {};
	}, [tabHooks]);

	return {
		tabs,
		getTabActions,
		getTabHandlers,
		getTabState,
	};
};

export const useKioskDetailBreadcrumbs = ({ kiosk }: { kiosk?: Kiosk }): PageContainerProps['breadcrumbs'] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.kiosk.title'), href: '../kiosks' },
		{ title: kiosk?.name || translate('nikki.vendingMachine.kiosk.detail.title'), href: '#' },
	], [kiosk?.name, translate]);
};