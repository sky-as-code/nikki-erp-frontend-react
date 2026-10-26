import type { Module, ModuleCategoryCode } from '@nikkierp/shell/erpModules';


export type ModuleViewMode = 'grid' | 'list';
export type GroupByOption = 'none' | 'category';

export type FilterState = {
	showUnavailable: boolean,
	groupBy: GroupByOption,
};

/** What a module card or row renders. `slug` is the backend module name, which is also its route. */
export type ModuleCardItem = {
	slug: string,
	name: string,
	modelPrefixes?: string[],
	category: ModuleCategoryCode,
	isOrphaned: boolean,
	isEnabled: boolean,
	isAuthorized: boolean,
	isUnavailable: boolean,
};

/** `label` is null for the single group "No grouping" produces, which renders without a header. */
export type ModuleGroup = {
	key: string,
	label: string | null,
	modules: ModuleCardItem[],
};

export type CompareFn = (a: string, b: string) => number;

export type ModuleCardContext = {
	translateName: (module: Module) => string,
	canAccess: (module: Pick<Module, 'name' | 'model_prefixes'>) => boolean,
};

export const DEFAULT_MODULE_CATEGORY: ModuleCategoryCode = 'foundation';

export const DEFAULT_FILTERS: FilterState = { showUnavailable: false, groupBy: 'category' };


export function isUnavailableModule(item: Pick<ModuleCardItem, 'isEnabled' | 'isOrphaned' | 'isAuthorized'>): boolean {
	return !item.isEnabled || item.isOrphaned || !item.isAuthorized;
}

/** Modules without a UI have nothing to open, so they never become cards, whatever the filter says. */
export function toModuleCardItems(modules: Module[], context: ModuleCardContext): ModuleCardItem[] {
	return modules
		.filter((module) => module.has_ui)
		.map((module) => {
			const base = {
				slug: module.name,
				name: context.translateName(module),
				modelPrefixes: module.model_prefixes,
				category: module.category ?? DEFAULT_MODULE_CATEGORY,
				isOrphaned: module.is_orphaned,
				isEnabled: module.is_enabled,
				isAuthorized: context.canAccess(module),
			};
			return { ...base, isUnavailable: isUnavailableModule(base) };
		});
}

export function filterModuleItems(
	items: ModuleCardItem[], searchQuery: string, showUnavailable: boolean,
): ModuleCardItem[] {
	const query = searchQuery.trim().toLowerCase();
	return items.filter((item) => {
		if (!showUnavailable && item.isUnavailable) {
			return false;
		}
		return !query || item.name.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query);
	});
}

export function sortModuleItems(items: ModuleCardItem[], compare: CompareFn): ModuleCardItem[] {
	return [...items].sort((left, right) => compare(left.name, right.name) || compare(left.slug, right.slug));
}

export function groupModuleItems(
	items: ModuleCardItem[],
	groupBy: GroupByOption,
	categoryLabel: (category: ModuleCategoryCode) => string,
	compare: CompareFn,
): ModuleGroup[] {
	if (items.length === 0) {
		return [];
	}
	if (groupBy === 'none') {
		return [{ key: 'all', label: null, modules: sortModuleItems(items, compare) }];
	}
	const byCategory = new Map<ModuleCategoryCode, ModuleCardItem[]>();
	items.forEach((item) => {
		byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item]);
	});
	return [...byCategory.entries()]
		.map(([category, modules]) => ({
			key: category,
			label: categoryLabel(category),
			modules: sortModuleItems(modules, compare),
		}))
		.sort((left, right) => compare(left.label, right.label));
}
