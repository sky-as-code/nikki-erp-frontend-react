import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { mockModules as mockModuleListByCategory } from './mockModules';
import { FilterState, ModuleViewMode } from './ModuleHomePage';



export function useQueryModule() {
	const [viewMode, setViewMode] = useState<ModuleViewMode>('list');
	const {
		searchQuery,
		searchInputValue,
		handleSearchChange,
		handleSearchClear,
	} = useDebouncedSearch(300);

	const [filters, setFilters] = useState<FilterState>({
		showDisabled: false,
		showOrphaned: false,
		sortBy: null,
		groupBy: null,
	});

	const filteredModules = useMemo(
		() => filterModules(mockModuleListByCategory, searchQuery, filters),
		[searchQuery, filters],
	);

	return {
		// View mode
		viewMode,
		setViewMode,
		// Search
		searchQuery, // Debounced search query used for filtering
		searchInputValue, // Current input value (not debounced)
		handleSearchChange,
		handleSearchClear,
		// Filters
		filters,
		setFilters,
		// Filtered modules
		filteredModules,
	};
}


function useDebouncedSearch(debounceDelay: number) {
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [searchInputValue, setSearchInputValue] = useState<string>('');

	useEffect(() => {
		setSearchInputValue(searchQuery);
	}, [searchQuery]);

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

	return {
		searchQuery,
		searchInputValue,
		handleSearchChange,
		handleSearchClear,
	};
}

function filterModules(
	modules: any[],
	searchQuery: string,
	filters: FilterState,
): any[] {
	let result = [...modules];

	result = filterBySearchQuery(result, searchQuery);
	result = filterByDisabled(result, filters.showDisabled);
	result = filterByOrphaned(result, filters.showOrphaned);
	result = sortModulesInCategories(result, filters.sortBy);

	return result;
}

function filterCategoriesWithModules(categories: any[]): any[] {
	return categories.filter((category) => category.modules.length > 0);
}

function filterBySearchQuery(categories: any[], searchQuery: string): any[] {
	if (!searchQuery.trim()) {
		return categories;
	}

	const query = searchQuery.toLowerCase().trim();
	return filterCategoriesWithModules(
		categories.map((category) => ({
			...category,
			modules: category.modules.filter((module: any) =>
				module.name.toLowerCase().includes(query) ||
				module.slug.toLowerCase().includes(query) ||
				module.category?.toLowerCase().includes(query),
			),
		})),
	);
}

function filterByDisabled(categories: any[], showDisabled: boolean): any[] {
	if (showDisabled) {
		return categories;
	}

	return filterCategoriesWithModules(
		categories.map((category) => ({
			...category,
			modules: category.modules.filter((module: any) => !module.isDisabled),
		})),
	);
}

function filterByOrphaned(categories: any[], showOrphaned: boolean): any[] {
	if (showOrphaned) {
		return categories;
	}

	return filterCategoriesWithModules(
		categories.map((category) => ({
			...category,
			modules: category.modules.filter((module: any) => !module.isOrphaned),
		})),
	);
}

function sortModulesInCategories(categories: any[], sortBy: string | null): any[] {
	if (!sortBy) {
		return categories;
	}

	return categories.map((category) => {
		const sortedModules = [...category.modules].sort((a: any, b: any) => {
			if (sortBy === 'Name') {
				return a.name.localeCompare(b.name);
			}
			if (sortBy === 'Commonly used') {
				const aDate = new Date(a.lastUsed || 0).getTime();
				const bDate = new Date(b.lastUsed || 0).getTime();
				return bDate - aDate; // Most recent first
			}
			return 0;
		});
		return { ...category, modules: sortedModules };
	});
}
