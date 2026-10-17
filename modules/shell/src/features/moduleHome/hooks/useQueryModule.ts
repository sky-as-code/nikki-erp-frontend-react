import { RestSearchResponse } from '@nikkierp/common/dynamicModel';
import { Module, ModuleCategoryCode, useModuleAccess } from '@nikkierp/shell/erpModules';
import { useLocaleCollator, useTranslate } from '@nikkierp/ui/i18n';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
	DEFAULT_FILTERS, filterModuleItems, FilterState, groupModuleItems, ModuleCardItem, ModuleViewMode,
	toModuleCardItems,
} from '../moduleHomeModel';


export type { ModuleCardItem, ModuleGroup } from '../moduleHomeModel';


export function useQueryModule(allModules: RestSearchResponse<Module> | null) {
	const [viewMode, setViewMode] = useState<ModuleViewMode>('list');
	const search = useDebouncedSearch(300);
	const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
	const { cards, isAccessPending } = useModuleCards(allModules);
	const groups = useModuleGroups(cards, search.searchQuery, filters);

	return {
		viewMode,
		setViewMode,
		/** Debounced; what the list is filtered by. */
		searchQuery: search.searchQuery,
		/** The input's own value, ahead of the debounce. */
		searchInputValue: search.searchInputValue,
		handleSearchChange: search.handleSearchChange,
		handleSearchClear: search.handleSearchClear,
		filters,
		setFilters,
		groups,
		/** Until the user context loads, every module would read as unauthorized. */
		isAccessPending,
	};
}

function useModuleCards(allModules: RestSearchResponse<Module> | null) {
	const translate = useTranslate('common');
	const { canAccess, isPending } = useModuleAccess();
	const cards = useMemo<ModuleCardItem[]>(
		() => (isPending ? [] : toModuleCardItems(allModules?.items ?? [], {
			translateName: (module) => translate(`module.label.${module.name}`, { defaultValue: module.name }),
			canAccess,
		})),
		[allModules, canAccess, isPending, translate],
	);
	return { cards, isAccessPending: isPending };
}

function useModuleGroups(cards: ModuleCardItem[], searchQuery: string, filters: FilterState) {
	const translate = useTranslate('common');
	const compare = useLocaleCollator();
	const categoryLabel = useCallback(
		(category: ModuleCategoryCode) => translate(`module.category.${category}`),
		[translate],
	);
	return useMemo(
		() => groupModuleItems(
			filterModuleItems(cards, searchQuery, filters.showUnavailable),
			filters.groupBy, categoryLabel, compare,
		),
		[cards, searchQuery, filters, categoryLabel, compare],
	);
}

function useDebouncedSearch(debounceDelay: number) {
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [searchInputValue, setSearchInputValue] = useState<string>('');

	const debouncedSearch = useMemo(
		() => debounce((query: string) => setSearchQuery(query), debounceDelay),
		[debounceDelay],
	);

	useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

	const handleSearchChange = (value: string) => {
		setSearchInputValue(value);
		debouncedSearch(value);
	};

	const handleSearchClear = () => {
		debouncedSearch.cancel();
		setSearchInputValue('');
		setSearchQuery('');
	};

	return { searchQuery, searchInputValue, handleSearchChange, handleSearchClear };
}
