import { FilterGroupConfig, FilterState, FilterTag, SearchGraph, SearchNode } from './types';

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
	const filterNodes: SearchNode[] = state.filter.flatMap((filter): SearchNode[] => {
		if (filter.values.length === 0) return [];

		// If multiple values, use OR condition
		if (filter.values.length > 1) {
			const node: SearchNode = {
				or: filter.values.map((value): SearchNode => ({
					if: [filter.key, filter.operator || '=', value],
				})),
			};
			return [node];
		}

		// Single value
		const node: SearchNode = {
			if: [filter.key, filter.operator || '=', filter.values[0]],
		};
		return [node];
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

/**
 * Update search value in filter state
 */
export function updateSearchInState(
	state: FilterState,
	fieldKey: string,
	value: string,
	config?: FilterGroupConfig,
): FilterState {
	const searchIndex = state.search.findIndex((s) => s.key === fieldKey);
	const newSearch = [...state.search];

	if (value.trim()) {
		if (searchIndex >= 0) {
			newSearch[searchIndex] = { ...newSearch[searchIndex], value };
		}
		else {
			const searchConfig = config?.search?.find((s) => s.key === fieldKey);
			newSearch.push({
				key: fieldKey,
				value,
				operator: searchConfig?.operator || '~',
			});
		}
	}
	else {
		if (searchIndex >= 0) {
			newSearch.splice(searchIndex, 1);
		}
	}

	return { ...state, search: newSearch };
}

/**
 * Update filter values in filter state
 */
export function updateFilterInState(
	state: FilterState,
	key: string,
	values: (string | number | boolean)[],
	config?: FilterGroupConfig,
): FilterState {
	const filterIndex = state.filter.findIndex((f) => f.key === key);
	const newFilter = [...state.filter];

	if (values.length > 0) {
		if (filterIndex >= 0) {
			newFilter[filterIndex] = { ...newFilter[filterIndex], values };
		}
		else {
			const filterConfig = config?.filter?.find((f) => f.key === key);
			newFilter.push({
				key,
				values,
				operator: filterConfig?.operator || '=',
			});
		}
	}
	else {
		if (filterIndex >= 0) {
			newFilter.splice(filterIndex, 1);
		}
	}

	return { ...state, filter: newFilter };
}

/**
 * Remove sort by field key from filter state
 */
export function removeSortFromState(state: FilterState, key: string): FilterState {
	return {
		...state,
		sort: state.sort.filter((s) => s.field !== key),
	};
}



interface ConvertStateToTagsOptions {
	state: FilterState;
	config?: FilterGroupConfig;
	translate: (key: string) => string;
	onSearchRemove: (key: string) => void;
	onFilterRemove: (key: string) => void;
	onGroupByRemove: () => void;
	onSortRemove: () => void;
}

interface CreateTagOptions {
	type: FilterTag['type'];
	key: string;
	label: string;
	value: string | string[];
	onRemove: () => void;
}

/**
 * Helper function để tạo FilterTag từ các thông tin cơ bản
 */
function createTag(options: CreateTagOptions): FilterTag {
	return {
		type: options.type,
		key: options.key,
		label: options.label,
		value: options.value,
		onRemove: options.onRemove,
	};
}

/**
 * Helper function để tìm label từ config array
 */
function findLabelFromConfig<T extends { key: string; label: string }>(
	configArray: T[] | undefined,
	key: string,
): string {
	const config = configArray?.find((item) => item.key === key);
	return config?.label || key;
}

interface StateHandler<T> {
	type: FilterTag['type'];
	items: T[];
	getConfig: () => { key: string; label: string }[] | undefined;
	getItemKey: (item: T) => string;
	getValue: (item: T) => string | string[];
	getOnRemove: (item: T) => () => void;
}

/**
 * Tạo state handlers để xử lý các loại state khác nhau
 */
function createStateHandlers(
	state: FilterState,
	config: FilterGroupConfig | undefined,
	onSearchRemove: (key: string) => void,
	onFilterRemove: (key: string) => void,
): StateHandler<any>[] {
	return [
		{
			type: 'search' as const,
			items: state.search,
			getConfig: () => config?.search,
			getItemKey: (item) => item.key,
			getValue: (item) => item.value,
			getOnRemove: (item) => () => onSearchRemove(item.key),
		},
		{
			type: 'filter' as const,
			items: state.filter,
			getConfig: () => config?.filter,
			getItemKey: (item) => item.key,
			getValue: (item) => item.values.map(String),
			getOnRemove: (item) => () => onFilterRemove(item.key),
		},
	];
}

/**
 * Chuyển đổi filter state thành mảng FilterTag để hiển thị
 */
export function convertStateToTags(options: ConvertStateToTagsOptions): FilterTag[] {
	const { state, config, translate, onSearchRemove, onFilterRemove, onSortRemove, onGroupByRemove } = options;
	const result: FilterTag[] = [];

	// Tạo handlers cho các loại state
	const stateHandlers = createStateHandlers(state, config, onSearchRemove, onFilterRemove);

	// Loop qua các loại state và tạo tags
	stateHandlers.forEach((handler) => {
		handler.items.forEach((item) => {
			const itemKey = handler.getItemKey(item);
			const configArray = handler.getConfig();
			result.push(
				createTag({
					type: handler.type,
					key: itemKey,
					label: findLabelFromConfig(configArray, itemKey),
					value: handler.getValue(item),
					onRemove: handler.getOnRemove(item),
				}),
			);
		});
	});

	// Xử lý sort - tạo tag riêng cho mỗi sort field
	if(state.sort.length > 0) {
		const sortLabels = state.sort?.map((s) => {
			const label = findLabelFromConfig(config?.sort, s.field);
			return `${label}:${s.direction}`;
		});
		result.push(
			createTag({
				type: 'sort',
				key: 'sort',
				label: translate('nikki.general.sort.title'),
				value: sortLabels.join(' > '),
				onRemove: onSortRemove,
			}),
		);
	}

	// Xử lý groupBy đặc biệt (cần format thành một tag duy nhất)
	if (state.groupBy.length > 0) {
		const groupByLabels = state.groupBy.map((key) => findLabelFromConfig(config?.groupBy, key));
		result.push(
			createTag({
				type: 'groupBy',
				key: 'groupBy',
				label: translate('nikki.general.groupBy.title'),
				value: groupByLabels.join(' > '),
				onRemove: onGroupByRemove,
			}),
		);
	}

	return result;
}