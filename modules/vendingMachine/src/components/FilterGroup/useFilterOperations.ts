/* eslint-disable max-lines-per-function */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterGroupConfig, FilterState, FilterTag, SearchOrder } from './types';
import {
	convertStateToTags,
	updateFilterInState,
	updateSearchInState,
} from './utils';


export interface UseFilterOperationsOptions {
	state: FilterState;
	updateState: (updates: Partial<FilterState>) => void;
	config?: FilterGroupConfig;
}

/**
 * Hook nội bộ để xử lý các operations trên filter state
 * Hook này nhận state từ bên ngoài và cung cấp các handlers để thay đổi state
 * Cũng tạo tags từ state để hiển thị
 */
export function useFilterOperations(options: UseFilterOperationsOptions) {
	const { state, updateState, config } = options;
	const { t: translate } = useTranslation();

	const handleSearchChange = useCallback((fieldKey: string, value: string) => {
		const newState = updateSearchInState(state, fieldKey, value, config);
		updateState(newState);
	}, [state, config, updateState]);

	const handleFilterChange = useCallback((key: string, values: (string | number | boolean)[]) => {
		const newState = updateFilterInState(state, key, values, config);
		updateState(newState);
	}, [state, config, updateState]);

	const handleGroupByChange = useCallback((keys: string[]) => {
		updateState({ groupBy: keys });
	}, [updateState]);

	const handleSortChange = useCallback((node: SearchOrder | null) => {
		if(!node) {
			updateState({ sort: [] });
			return;
		}

		const sortIndex = state.sort.findIndex((s) => s.field === node.field);
		const newSort = [...state.sort];

		if (sortIndex >= 0) {
			newSort[sortIndex] = {...node};
		}
		else {
			newSort.push(node);
		}

		updateState({ sort: newSort });
	}, [state.sort, updateState]);

	// Generate tags from filter state
	const tags: FilterTag[] = useMemo(() => {
		return convertStateToTags({
			state,
			config,
			translate,
			onSearchRemove: (key: string) => handleSearchChange(key, ''),
			onFilterRemove: (key: string) => handleFilterChange(key, []),
			onSortRemove: () => updateState({ sort: [] }),
			onGroupByRemove: () => updateState({ groupBy: [] }),
		});
	}, [
		state,
		config,
		translate,
		handleSearchChange,
		handleFilterChange,
		updateState,
	]);

	return {
		handleSearchChange,
		handleFilterChange,
		handleGroupByChange,
		handleSortChange,
		tags,
	};
}
