import * as dyn from '@nikkierp/common/dynamicModel';


export function shallowEqualStringArray(a?: string[], b?: string[]): boolean {
	if (a === b) {
		return true;
	}
	if (a == null || b == null) {
		return a === b;
	}
	if (a.length !== b.length) {
		return false;
	}
	return a.every((value, index) => value === b[index]);
}

export function isSameSearchRequest(prev: dyn.RestSearchRequest, next: dyn.RestSearchRequest): boolean {
	return prev.page === next.page
		&& prev.size === next.size
		&& prev.search_name === next.search_name
		&& prev.language === next.language
		&& prev.graph === next.graph
		// Absent and false mean the same thing to the server, so they must compare equal here
		// too — otherwise clearing the toggle would look like a change and republish.
		&& (prev.include_archived ?? false) === (next.include_archived ?? false)
		&& shallowEqualStringArray(prev.fields, next.fields);
}

export function getSearchRequestOrderBy(request: dyn.RestSearchRequest): dyn.OrderBy {
	const rawOrder = (request.graph as Partial<dyn.SearchGraph> | undefined)?.order;
	if (!Array.isArray(rawOrder)) {
		return [];
	}
	return rawOrder.filter(
		(item): item is [string, dyn.SearchOrder] =>
			Array.isArray(item)
			&& item.length === 2
			&& typeof item[0] === 'string'
			&& (item[1] === 'asc' || item[1] === 'desc'),
	);
}
