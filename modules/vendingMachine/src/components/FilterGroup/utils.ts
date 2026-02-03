/* eslint-disable max-lines-per-function */
import { FilterConditionNode, FilterConfig, FilterGroupConfig, FilterState, FilterTag, FilterValue, SearchGraph, SearchNode } from './types';

/**
 * Generate nodeId for a filter node based on parent path and index
 */
function generateFilterNodeId(
	key: string,
	parentPath?: string,
	index?: number,
): string {
	return parentPath !== undefined && index !== undefined
		? `${parentPath}-${key}_${index}`
		: key;
}

/**
 * Check if a node or any of its descendants have filter values
 */
function hasFilterValueForNode(
	filterValues: FilterState['filter'],
	nodeId: string,
): boolean {
	return filterValues.some((fv) => {
		if (!fv.nodeId) return false;
		return fv.nodeId === nodeId || fv.nodeId.startsWith(`${nodeId}-`);
	});
}

/**
 * Convert simple filter operator to SearchNode
 */
function convertSimpleOperatorToSearchNode(
	key: string,
	operator: string,
	value: any,
	filterConfig?: FilterConfig | FilterConditionNode,
): SearchNode[] {
	// Handle range type: convert [min, max] to >= min AND <= max
	if (filterConfig?.component?.type === 'range_number' && Array.isArray(value) && value.length === 2) {
		const [min, max] = value as [number, number];
		const andNodes: SearchNode[] = [
			{ if: [key, '>=' as const, min] },
			{ if: [key, '<=' as const, max] },
		];
		return [{ and: andNodes }];
	}


	// Handle 'in' operator - convert to multiple 'or' conditions
	if (operator === 'in' && Array.isArray(value)) {
		const orNodes: SearchNode[] = value.map((val) => ({
			if: [key, '=' as const, val],
		}));
		return orNodes.length === 1 ? orNodes : [{ or: orNodes }];
	}

	// Handle 'not_in' operator - convert to multiple 'and' conditions with '!='
	if (operator === 'not_in' && Array.isArray(value)) {
		const andNodes: SearchNode[] = value.map((val) => ({
			if: [key, '!=' as const, val],
		}));
		return andNodes.length === 1 ? andNodes : [{ and: andNodes }];
	}

	// Handle 'is_set' operator
	if (operator === 'is_set') {
		return [{
			if: [key, '!=' as const, ''],
		}];
	}

	// Handle 'is_not_set' operator
	if (operator === 'is_not_set') {
		return [{
			if: [key, '=' as const, ''],
		}];
	}

	// For other operators, create simple SearchNode with 'if' property
	const validSearchOperators = ['^', '$', '=', '!=', '>', '<', '>=', '<=', '~', '!~'];
	if (validSearchOperators.includes(operator)) {
		return [{
			if: [key, operator as any, value],
		}];
	}

	return [];
}

/**
 * Convert nested condition ($and/$or) to SearchNodes
 */
function convertNestedConditionToSearchNodes(
	filterValues: FilterState['filter'],
	nodeId: string,
	operator: '$and' | '$or',
	childNodes: FilterConditionNode[],
): SearchNode[] {
	const convertedChildNodes: SearchNode[] = [];

	for (let childIndex = 0; childIndex < childNodes.length; childIndex++) {
		const childNode = childNodes[childIndex];
		const childNodeId = generateFilterNodeId(childNode.key, nodeId, childIndex);

		if (hasFilterValueForNode(filterValues, childNodeId)) {
			const childSearchNodes = convertFilterConditionTreeToSearchNodes(
				filterValues,
				childNode,
				nodeId,
				childIndex,
			);
			convertedChildNodes.push(...childSearchNodes);
		}
	}

	if (convertedChildNodes.length === 0) {
		return [];
	}

	if (convertedChildNodes.length === 1) {
		return convertedChildNodes;
	}

	const result: SearchNode = {};
	if (operator === '$and') {
		result.and = convertedChildNodes;
	}
	else {
		result.or = convertedChildNodes;
	}
	return [result];
}

/**
 * Convert filter condition tree to SearchNodes
 * Traverses the filter config condition tree and converts it to SearchNode structure
 * based on FilterValues that match by nodeId
 */
function convertFilterConditionTreeToSearchNodes(
	filterValues: FilterState['filter'],
	filterConfig: FilterConfig | FilterConditionNode | undefined,
	parentPath?: string,
	index?: number,
): SearchNode[] {
	if (!filterConfig) return [];

	const [operator, conditionValue] = filterConfig.condition;
	const nodeId = generateFilterNodeId(filterConfig.key, parentPath, index);

	// If operator is $and or $or, recursively convert children
	if (!filterConfig.component && ['$and', '$or'].includes(operator)) {
		const childNodes = conditionValue as FilterConditionNode[];
		return convertNestedConditionToSearchNodes(
			filterValues,
			nodeId,
			operator as '$and' | '$or',
			childNodes,
		);
	}

	// If operator is a simple FilterOperator, check if there's a FilterValue for this node
	const filterValue = filterValues.find((fv) => fv.nodeId === nodeId);
	if (!filterValue) {
		return [];
	}

	return convertSimpleOperatorToSearchNode(
		filterConfig.key,
		operator as string,
		filterValue.value,
		filterConfig,
	);
}

/**
 * Convert FilterState to SearchGraph format for backend API
 */
export function filterStateToSearchGraph(
	state: FilterState,
	config: FilterGroupConfig,
): SearchGraph {
	const graph: SearchGraph = {};

	// Convert search values to SearchNodes
	const searchNodes: SearchNode[] = state.search.map((search) => ({
		if: [search.key, search.operator || '~', search.value],
	}));

	// Convert filter values to SearchNodes
	const filterNodes: SearchNode[] = convertFilterConditionTreeToSearchNodes(
		state.filter,
		config?.filter,
	);

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
		graph.order = state.sort?.map(s=> [s.field, s.direction]);
	}

	// Add groupBy
	if (state.groupBy.length > 0) {
		graph.groupBy = state.groupBy;
	}

	return graph;
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
 * Update filter value in filter state based on nodeId
 * Nếu nodeId đã tồn tại, sẽ ghi đè giá trị
 * Nếu nodeId chưa tồn tại, sẽ thêm mới
 * Nếu value là null hoặc undefined, sẽ xóa filter value đó
 */

export function updateFilterInState(
	state: FilterState,
	nodeId: string,
	value: any,
	config?: FilterGroupConfig,
): FilterState {
	const filterIndex = state.filter.findIndex((f) => f.nodeId === nodeId);
	const newFilter = [...state.filter];

	// Nếu value là null hoặc undefined, xóa filter value
	if (value === null || value === undefined) {
		if (filterIndex >= 0) {
			newFilter.splice(filterIndex, 1);
		}
		return { ...state, filter: newFilter };
	}

	// Tìm filter config để lấy key và label
	// Cần traverse filter config để tìm node với nodeId tương ứng
	// nodeId được generate giống như trong ConditionNode: parentPath-key-index hoặc key (nếu là root)
	const findNodeInConfig = (
		node: FilterConfig | FilterConditionNode | undefined,
		targetNodeId: string,
		parentPath?: string,
		index?: number,
	): FilterConfig | FilterConditionNode | null => {
		if (!node) return null;

		// Generate nodeId giống như trong ConditionNode
		const currentNodeId = parentPath !== undefined && index !== undefined
			? `${parentPath}-${node.key}_${index}`
			: node.key;

		if (currentNodeId === targetNodeId) {
			return node;
		}

		const [operator, conditionValue] = node.condition;

		// Nếu là $and hoặc $or, tìm trong children
		if (operator === '$and' || operator === '$or') {
			const childNodes = conditionValue as FilterConditionNode[];
			for (let childIndex = 0; childIndex < childNodes.length; childIndex++) {
				const childNode = childNodes[childIndex];
				const found = findNodeInConfig(childNode, targetNodeId, currentNodeId, childIndex);
				if (found) return found;
			}
		}

		return null;
	};

	const filterConfig = config?.filter;
	const nodeConfig = filterConfig ? findNodeInConfig(filterConfig, nodeId, undefined, undefined) : null;

	const filterValue: FilterValue = {
		key: nodeConfig?.key || nodeId,
		label: nodeConfig?.label,
		nodeId,
		value,
	};

	// Nếu nodeId đã tồn tại, ghi đè giá trị
	if (filterIndex >= 0) {
		newFilter[filterIndex] = filterValue;
	}
	else {
		// Nếu chưa tồn tại, thêm mới
		newFilter.push(filterValue);
	}

	return { ...state, filter: newFilter };
}


/**
 * Helper function để tạo FilterTag từ các thông tin cơ bản
 */
interface CreateTagOptions {
	type: FilterTag['type'];
	key: string;
	label: string;
	value: string | string[];
	onRemove: () => void;
}
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


/**
 * Tìm các node con trực tiếp của root filter
 */
function getRootChildNodes(filterConfig: FilterConfig | FilterConditionNode | undefined): FilterConditionNode[] {
	if (!filterConfig) return [];

	const [operator, conditionValue] = filterConfig.condition;

	// Nếu root có condition là $and hoặc $or, trả về các node con
	if (operator === '$and' || operator === '$or') {
		return conditionValue as FilterConditionNode[];
	}

	return [];
}

/**
 * Generate nodeId giống như trong ConditionNode
 */
function generateNodeId(
	node: FilterConditionNode | FilterConfig,
	parentPath?: string,
	index?: number,
): string {
	return parentPath !== undefined && index !== undefined
		? `${parentPath}-${node.key}_${index}`
		: node.key;
}


/**
 * Format condition value để hiển thị
 */
function formatConditionValue(value: any): string {
	if (Array.isArray(value)) {
		return `[${value.map((v) => String(v)).join(', ')}]`;
	}
	return String(value);
}

/**
 * Format condition label từ node và operator
 */
function formatConditionLabel(
	node: FilterConditionNode | FilterConfig,
	operator: string,
	value: any,
): string {
	const label = node.label || node.key;
	const valueStr = formatConditionValue(value);
	return operator === '=' ? valueStr : `${label} ${operator} ${valueStr}`;
}

/**
 * Kiểm tra xem có filter value nào có nodeId bắt đầu bằng prefix không
 */
function hasFilterValueWithPrefix(
	filterValues: FilterState['filter'],
	prefix: string,
): boolean {
	return filterValues.some((fv) => fv.nodeId?.startsWith(prefix) ?? false);
}

/**
 * Tìm tất cả các filter values thuộc về một node con và các node con của nó
 */
function getFilterValuesForNode(
	filterValues: FilterState['filter'],
	node: FilterConditionNode | FilterConfig,
	rootNodeId: string,
	parentPath?: string,
	index?: number,
): FilterState['filter'] {
	const currentNodeId = generateNodeId(node, parentPath, index);
	const result: FilterState['filter'] = [];

	// Kiểm tra sớm: nếu không có filter value nào có nodeId bắt đầu bằng currentNodeId, skip luôn
	// Chỉ check nếu node có nested conditions (vì node đơn giản sẽ được check ở dưới)
	const [operator, conditionValue] = node.condition;
	if (operator === '$and' || operator === '$or') {
		// Tạo prefix để check: currentNodeId- (vì các node con sẽ có format currentNodeId-childKey_index)
		const prefix = `${currentNodeId}-`;
		const hasCurrentNode = hasFilterValueWithPrefix(filterValues, currentNodeId);
		const hasPrefixMatch = hasFilterValueWithPrefix(filterValues, prefix);
		if (!hasCurrentNode && !hasPrefixMatch) {
			return result; // Skip luôn nếu không có filter value nào liên quan
		}
	}

	// Tìm filter value trực tiếp cho node này
	const directValue = filterValues.find((fv) => fv.nodeId === currentNodeId);
	if (directValue) {
		result.push(directValue);
	}

	// Nếu node có nested conditions, tìm các filter values cho các node con
	if (operator === '$and' || operator === '$or') {
		const childNodes = conditionValue as FilterConditionNode[];
		for (let childIndex = 0; childIndex < childNodes.length; childIndex++) {
			const childNode = childNodes[childIndex];
			const childNodeId = generateNodeId(childNode, currentNodeId, childIndex);

			// Check sớm: nếu không có filter value nào có nodeId bắt đầu bằng childNodeId, skip
			const childPrefix = `${childNodeId}-`;
			const hasChildNode = hasFilterValueWithPrefix(filterValues, childNodeId);
			const hasChildPrefix = hasFilterValueWithPrefix(filterValues, childPrefix);
			if (!hasChildNode && !hasChildPrefix) {
				continue; // Skip node con này
			}

			const childValues = getFilterValuesForNode(
				filterValues,
				childNode,
				rootNodeId,
				currentNodeId,
				childIndex,
			);
			result.push(...childValues);
		}
	}

	return result;
}

/**
 * Format filter tag label cho một node con với các condition con
 */

function formatFilterTagLabel(
	node: FilterConditionNode | FilterConfig,
	filterValues: FilterState['filter'],
	rootNodeId: string,
	parentPath?: string,
	index?: number,
): string {
	const currentNodeId = generateNodeId(node, parentPath, index);
	if(node.component) {
		if(node.component.type === 'range_number') {
			const filterValue = filterValues.find((fv) => fv.nodeId === currentNodeId);
			if(filterValue) {
				const [min, max] = filterValue.value as [number, number];
				return `${node.label}: From ${min} to ${max}`;
			}
		}
	}

	const [operator, conditionValue] = node.condition;

	// Nếu không phải $and/$or, format đơn giản
	if (operator !== '$and' && operator !== '$or') {
		const filterValue = filterValues.find((fv) => fv.nodeId === currentNodeId);
		if (filterValue) {
			return formatConditionLabel(node, operator, filterValue.value);
		}
		return '';
	}

	// Nếu là $and hoặc $or, format các condition con
	const childNodes = conditionValue as FilterConditionNode[];
	const conditionLabels: string[] = [];

	for (let childIndex = 0; childIndex < childNodes.length; childIndex++) {
		const childNode = childNodes[childIndex];
		const childNodeId = generateNodeId(childNode, currentNodeId, childIndex);

		// Kiểm tra sớm: skip nếu không có filter value nào liên quan
		const childPrefix = `${childNodeId}-`;
		const hasChildNodeValue = hasFilterValueWithPrefix(filterValues, childNodeId);
		const hasChildPrefixValue = hasFilterValueWithPrefix(filterValues, childPrefix);
		if (!hasChildNodeValue && !hasChildPrefixValue) {
			continue; // Skip node con này
		}

		const childFilterValue = filterValues.find((fv) => fv.nodeId === childNodeId);

		const [childOperator] = childNode.condition;

		// Nếu child node có nested conditions, format đệ quy và thêm dấu ngoặc
		if (childOperator === '$and' || childOperator === '$or') {
			const nestedLabel = formatFilterTagLabel(
				childNode,
				filterValues,
				rootNodeId,
				currentNodeId,
				childIndex,
			);
			if (nestedLabel) {
				// Thêm dấu ngoặc cho nested condition để làm rõ thứ tự ưu tiên
				if(conditionLabels?.length > 0) {
					conditionLabels.push(`(${nestedLabel})`);
				}
				else {
					conditionLabels.push(nestedLabel);
				}
			}
		}
		else if (childFilterValue) {
			// Format condition đơn giản
			conditionLabels.push(formatConditionLabel(childNode, childOperator, childFilterValue.value));
		}
	}

	if (conditionLabels.length === 0) return '';

	// Join các condition với operator (AND hoặc OR)
	const operatorLabel = operator === '$and' ? ' AND ' : ' OR ';
	return conditionLabels.join(operatorLabel);
}


/**
 * Chuyển đổi filter state thành mảng FilterTag để hiển thị
 */
interface ConvertStateToTagsOptions {
	state: FilterState;
	config: FilterGroupConfig;
	translate: (key: string) => string;
	onSearchRemove: (key: string) => void;
	onFilterRemove: (nodeId: string) => void;
	onGroupByRemove: () => void;
	onSortRemove: () => void;
}

const createSearchTags = (items: FilterState['search'], config: FilterGroupConfig, onSearchRemove: (key: string) => void): FilterTag[] => {
	return items.map((item) => createTag({
		type: 'search',
		key: item.key,
		label: findLabelFromConfig(config.search, item.key),
		value: item.value,
		onRemove: () => onSearchRemove(item.key),
	}));
};
const createFilterTags = (items: FilterState['filter'], config: FilterGroupConfig, onFilterRemove: (nodeId: string) => void): FilterTag[] => {
	if (!config.filter) return [];

	// Lấy các node con trực tiếp của root filter
	const rootChildNodes = getRootChildNodes(config.filter);
	const rootNodeId = config.filter.key;

	const tags: FilterTag[] = [];

	// Duyệt qua từng node con của root
	for (let index = 0; index < rootChildNodes.length; index++) {
		const childNode = rootChildNodes[index];
		const childNodeId = generateNodeId(childNode, rootNodeId, index);

		// Kiểm tra sớm: nếu không có filter value nào có nodeId bắt đầu bằng childNodeId, skip luôn
		const childPrefix = `${childNodeId}-`;
		if (!hasFilterValueWithPrefix(items, childNodeId) && !hasFilterValueWithPrefix(items, childPrefix)) {
			continue; // Skip node con này
		}

		// Tìm tất cả filter values thuộc về node con này và các node con của nó
		const nodeFilterValues = getFilterValuesForNode(items, childNode, rootNodeId, rootNodeId, index);

		// Nếu có filter values, tạo tag
		if (nodeFilterValues.length > 0) {
			// Format label với các condition con
			const tagLabel = formatFilterTagLabel(childNode, items, rootNodeId, rootNodeId, index);

			if (tagLabel) {
				// Tạo handler để xóa tất cả filter values của node con này
				const handleRemove = () => {
					// Xóa tất cả filter values thuộc về node con này
					nodeFilterValues.forEach((fv) => {
						if (fv.nodeId) {
							onFilterRemove(fv.nodeId);
						}
					});
				};

				tags.push(createTag({
					type: 'filter',
					key: childNode.key,
					label: childNode.label || childNode.key,
					value: tagLabel,
					onRemove: handleRemove,
				}));
			}
		}
	}

	return tags;
};
const createSortTags = (items: FilterState['sort'], config: FilterGroupConfig, onSortRemove: () => void): FilterTag[] => {
	const sortLabels = items.map((s) => {
		const label = findLabelFromConfig(config?.sort, s.field);
		return `${label}:${s.direction}`;
	});
	return sortLabels.length > 0 ? [createTag({
		type: 'sort',
		key: 'sort',
		label: findLabelFromConfig(config.sort, 'sort'),
		value: sortLabels.join(' > '),
		onRemove: onSortRemove,
	})] : [];
};
const createGroupByTags = (items: FilterState['groupBy'], config: FilterGroupConfig, onGroupByRemove: () => void): FilterTag[] => {
	const groupByLabels = items.map((key) => findLabelFromConfig(config?.groupBy, key)) || [];
	return groupByLabels.length > 0 ? [
		createTag({
			type: 'groupBy',
			key: 'groupBy',
			label: findLabelFromConfig(config.groupBy, 'groupBy'),
			value: groupByLabels.join(' > '),
			onRemove: onGroupByRemove,
		}),
	] : [];
};

export function convertStateToTags(options: ConvertStateToTagsOptions): FilterTag[] {
	const { state, config, onSearchRemove, onFilterRemove, onSortRemove, onGroupByRemove } = options;

	const searchTags = createSearchTags(state.search, config, onSearchRemove) || [];
	const filterTags = createFilterTags(state.filter, config, onFilterRemove) || [];
	const sortTags = createSortTags(state.sort, config, onSortRemove) || [];
	const groupByTags = createGroupByTags(state.groupBy, config, onGroupByRemove) || [];

	return [...searchTags, ...filterTags, ...sortTags, ...groupByTags];
}