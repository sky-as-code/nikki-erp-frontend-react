import { camelToSnakeCase } from '@nikkierp/common/utils';

import { SearchGraph, SearchNode } from '../FilterGroup';


interface SimpleSearchFilter {
	key: string;
	type: 'search';
	value: string;
	searchFields: string[];
}

interface SimpleOptionFilter {
	key: string;
	type: 'select' | 'multiSelect';
	value: string[];
}

interface SimpleDateFilter {
	key: string;
	type: 'date';
	value: [Date | null, Date | null];
}

export type SimpleFilter = SimpleSearchFilter | SimpleOptionFilter | SimpleDateFilter;


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

	for (const filter of filters) {
		if (filter.type === 'search') {
			const trimmed = filter.value.trim();
			if (!trimmed) continue;
			const searchNodes: SearchNode[] = filter.searchFields.map((sf) => ({
				if: [camelToSnakeCase(sf), '*' as const, trimmed],
			}));
			andNodes.push(searchNodes.length === 1 ? searchNodes[0] : { or: searchNodes });
		}
		else if (filter.type === 'date') {
			const [startDate, endDate] = filter.value;
			if (startDate) {
				andNodes.push({ if: [camelToSnakeCase(filter.key), '>=', startDate.toISOString()] });
			}
			if (endDate) {
				andNodes.push({ if: [camelToSnakeCase(filter.key), '<=', endDate.toISOString()] });
			}
		}
		else {
			if (filter.value.length === 0) continue;
			const snakeKey = camelToSnakeCase(filter.key);
			if (filter.value.length === 1) {
				andNodes.push({ if: [snakeKey, '=' as const, filter.value[0]] });
			}
			else {
				andNodes.push({
					or: filter.value.map((val) => ({ if: [snakeKey, '=' as const, val] })),
				});
			}
		}
	}

	if (andNodes.length === 0) return {};
	if (andNodes.length === 1) {
		const [node] = andNodes;
		if (node.or) return { or: node.or };
		if (node.and) return { and: node.and };
	}
	return { and: andNodes };
}
