export type {
	TabId,
	UseKioskDetailPageConfigProps,
	UseKioskDetailPageConfigReturn,
	TabHookReturn,
} from './types';
export {
	KioskDetailTabControlProvider,
	useKioskDetailTabControl,
	useRegisterKioskDetailTab,
} from './KioskDetailTabControlContext';
export type { KioskDetailTabControlEntry } from './KioskDetailTabControlContext';
export { useBasicInfoTab } from './useBasicInfoTab';
export { useKioskDetailBreadcrumbs } from './useKioskDetailBreadcrumbs';
export { useKioskDetailPageConfig } from './useKioskDetailPageConfig';
export {
	buildKioskSettingActions,
	useKioskSettingTab,
	useKioskSettingTabForm,
} from './useKioskSettingTab';
export type {
	UseKioskSettingTabFormArgs,
	UseKioskSettingTabFormReturn,
	UseKioskSettingTabReturn,
} from './useKioskSettingTab';
export {
	buildProductsGridActions,
	useProductsGridTab,
} from './useProductsGridTab';
export type { UseProductsGridTabArgs, UseProductsGridTabReturn } from './useProductsGridTab';
