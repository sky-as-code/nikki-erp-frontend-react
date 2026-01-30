import { useCallback, useEffect, useMemo, useState } from 'react';

import { FilterState, SearchGraph } from './types';
import { filterStateToSearchGraph } from './utils';


export interface UseFilterStateOptions {
	initialState?: Partial<FilterState>;
	onSearchGraphChange?: (graph: SearchGraph) => void;
}

export function useFilterState(options: UseFilterStateOptions = {}) {
	const { initialState, onSearchGraphChange } = options;

	const [state, setState] = useState<FilterState>({
		search: [],
		filter: [],
		groupBy: [],
		sort: [],
		...initialState,
	});

	const searchGraph = useMemo(() => {
		return filterStateToSearchGraph(state);
	}, [state]);

	useEffect(() => {
		if (onSearchGraphChange) {
			onSearchGraphChange(searchGraph);
		}
	}, [searchGraph, onSearchGraphChange]);

	const updateState = useCallback((updates: Partial<FilterState>) => {
		setState((prev) => ({ ...prev, ...updates }));
	}, []);

	const resetState = useCallback(() => {
		setState({
			search: [],
			filter: [],
			groupBy: [],
			sort: [],
		});
	}, []);

	return {
		state,
		setState,
		updateState,
		resetState,
		searchGraph,
	};
}
