import { camelToSnakeCase } from '@nikkierp/common/utils';

import { SearchGraph, SearchNode, SearchOperator } from '@/types';


interface BaseSimpleFilter {
	key: string;
	type: string;
	getGraphValue?: (value: any) => SimpleFilter['value'];
}

interface SimpleSearchFilter extends BaseSimpleFilter {
	value: string;
	searchFields: string[];
}

interface SimpleOptionFilter extends BaseSimpleFilter {
	value: number[] | string[] | boolean[];
}

interface SimpleDateFilter extends BaseSimpleFilter {
	value: [Date | null, Date | null];
}

export type SimpleFilter = SimpleSearchFilter | SimpleOptionFilter | SimpleDateFilter;

function getSearchCondition(filter: SimpleSearchFilter): SearchNode[] | null {
	const trimmed = filter?.value?.trim();
	if (!trimmed || !filter.searchFields?.length) return null;

	const searchNodes: SearchNode[] = filter.searchFields.map((sf) => ({
		if: [camelToSnakeCase(sf), SearchOperator.CONTAINS, trimmed],
	}));
	return searchNodes.length === 1 ? searchNodes : [{ or: searchNodes }];
}

function getDateCondition(filter: SimpleDateFilter): SearchNode[] | null {
	const [startDate, endDate] = filter.value;
	if (!startDate && !endDate) return null;

	const nodes: SearchNode[] = [];
	if (startDate) {
		nodes.push({ if: [
			camelToSnakeCase(filter.key),
			SearchOperator.GREATER_THAN_OR_EQUAL,
			startDate.toISOString(),
		] });
	}
	if (endDate) {
		nodes.push({ if: [
			camelToSnakeCase(filter.key),
			SearchOperator.LESS_THAN_OR_EQUAL,
			endDate.toISOString(),
		] });
	}
	return nodes;
}

function getOptionCondition(filter: SimpleOptionFilter): SearchNode[]  | null {
	const { key, value } = filter;
	if (!value || value.length === 0) return null;

	const snakeKey = camelToSnakeCase(key);
	const orNodes: SearchNode[] = value.map((val) => ({ if: [snakeKey, SearchOperator.EQUAL, val] }));
	return orNodes.length === 1 ? orNodes : [{ or: orNodes }];
}


function getConditions(filter: SimpleFilter): SearchNode[] | null {
	const conditionMap: Record<string, (filter: any) => SearchNode[] | null> = {
		search: getSearchCondition,
		date: getDateCondition,
		select: getOptionCondition,
		multiSelect: getOptionCondition,
	};
	return conditionMap[filter.type]({
		...filter,
		value: filter.getGraphValue?.(filter.value) ?? filter.value,
	});
}
/**
 * Convert a unified filter list to SearchGraph for backend API.
 *
 * - type='search': value searches across fields with '*' (contains, OR)
 * - type='select'|'multiSelect' (default): selected values become '=' conditions (OR within same key)
 * - All groups are combined with AND
 * - All field keys are converted to snake_case for the backend
 */
export function buildSimpleSearchGraph(filters: SimpleFilter[]): SearchGraph {
	const andNodes: SearchNode[] = [];

	filters.forEach((filter) => {
		const condition = getConditions(filter);
		if(!condition || condition.length === 0) return;
		andNodes.push(...condition);
	});

	if (andNodes.length === 0) return {};
	if (andNodes.length === 1) {
		const [node] = andNodes;
		if (node.or) return { or: node.or };
		if (node.and) return { and: node.and };
	}
	return { and: andNodes };
}
