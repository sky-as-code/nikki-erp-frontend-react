import { buildColumnsQuery } from '@nikkierp/common/utils';
import { SearchParamsOption } from 'ky';

import { SearchParams } from '@/types';


export function buildSearchParams<T extends object>(params?: SearchParams<T>): SearchParamsOption {
	const { page, size, graph, columns } = params ?? {};
	return [
		...(page ? [['page', String(page)]] : []),
		...(size ? [['size', String(size)]] : []),
		...(graph ? [['graph', JSON.stringify(graph)]] : []),
		...buildColumnsQuery<T>(columns || []),
	];
}