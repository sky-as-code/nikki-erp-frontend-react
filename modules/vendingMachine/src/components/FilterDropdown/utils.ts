import { FilterState, SearchGraph, SearchNode, SearchOrder } from './types';

/**
 * Convert FilterState to SearchGraph format for backend API
 */
export function filterStateToSearchGraph(state: FilterState): SearchGraph {
	const graph: SearchGraph = {};

	// Convert search values to SearchNodes
	const searchNodes: SearchNode[] = state.search.map((search) => ({
		if: [search.key, search.operator || '~', search.value],
	}));

	// Convert filter values to SearchNodes
	const filterNodes: SearchNode[] = state.filter.flatMap((filter) => {
		if (filter.values.length === 0) return [];

		// If multiple values, use OR condition
		if (filter.values.length > 1) {
			return [
				{
					or: filter.values.map((value) => ({
						if: [filter.key, filter.operator || '=', value],
					})),
				},
			];
		}

		// Single value
		return [
			{
				if: [filter.key, filter.operator || '=', filter.values[0]],
			},
		];
	});

	// Combine search and filter nodes
	const allNodes = [...searchNodes, ...filterNodes];

	if (allNodes.length > 0) {
		// If multiple conditions, wrap in AND
		if (allNodes.length === 1) {
			Object.assign(graph, allNodes[0]);
		}
		else {
			graph.and = allNodes;
		}
	}

	// Add order
	if (state.sort.length > 0) {
		graph.order = state.sort;
	}

	// Add groupBy
	if (state.groupBy.length > 0) {
		graph.groupBy = state.groupBy;
	}

	return graph;
}

/**
 * Convert SearchGraph to FilterState
 */
export function searchGraphToFilterState(graph: SearchGraph): FilterState {
	const state: FilterState = {
		search: [],
		filter: [],
		groupBy: graph.groupBy || [],
		sort: graph.order || [],
	};

	// Extract search and filter from graph
	const extractNodes = (node: SearchNode | SearchGraph): void => {
		if (node.if) {
			const [key, operator, value] = node.if;
			// Determine if it's a search (text operator like ~, ^, $) or filter
			if (operator === '~' || operator === '^' || operator === '$') {
				state.search.push({
					key,
					value: String(value),
					operator,
				});
			}
			else {
				const existingFilter = state.filter.find((f) => f.key === key);
				if (existingFilter) {
					existingFilter.values.push(value);
				}
				else {
					state.filter.push({
						key,
						values: [value],
						operator,
					});
				}
			}
		}

		if (node.and) {
			node.and.forEach(extractNodes);
		}

		if (node.or) {
			node.or.forEach(extractNodes);
		}
	};

	if (graph.if) {
		extractNodes({ if: graph.if });
	}

	if (graph.and) {
		graph.and.forEach(extractNodes);
	}

	if (graph.or) {
		graph.or.forEach(extractNodes);
	}

	return state;
}

/**
 * Format filter tag display text
 */
export function formatFilterTag(
	type: 'search' | 'filter',
	key: string,
	value: string | string[],
	config?: { search?: any[]; filter?: any[] },
): string {
	if (type === 'search') {
		const searchConfig = config?.search?.find((s) => s.key === key);
		const label = searchConfig?.label || key;
		return `${label}: ${value}`;
	}

	const filterConfig = config?.filter?.find((f) => f.key === key);
	const label = filterConfig?.label || key;

	if (Array.isArray(value)) {
		return `${label}: ${value.join(' or ')}`;
	}

	return `${label}: ${value}`;
}
