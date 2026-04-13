import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	VendingMachineDispatch,
	kioskModelActions,
	selectKioskModelList,
	selectKioskModelListPagination,
	DEFAULT_PAGE_SIZE,
	ListKioskModelsParams,
} from '@/appState';
import { buildSimpleSearchGraph } from '@/components/ControlPanel/buildSimpleSearchGraph';
import { ControlPanelFilterConfig } from '@/components/ControlPanel/types';
import { SearchGraph } from '@/components/FilterGroup';


export function useKioskModelList(graph?: SearchGraph) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskModelList);
	const pagination = useMicroAppSelector(selectKioskModelListPagination);

	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: ListKioskModelsParams = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(kioskModelActions.listKioskModels(params));
	}, [dispatch]);

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handlePageChange = React.useCallback((newPage: number) => {
		setPage(newPage);
		fetchList(newPage, pageSize, graph);
	}, [fetchList, pageSize, graph]);

	const handlePageSizeChange = React.useCallback((value: string | null) => {
		const newSize = Number(value ?? DEFAULT_PAGE_SIZE);
		setPageSize(newSize);
		setPage(1);
		fetchList(1, newSize, graph);
	}, [fetchList, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const totalPages = Math.max(1, Math.ceil(pagination.total / (pagination.size || pageSize)));

	const hasData = Array.isArray(list.data) && list.data.length > 0;
	const isInitialLoading = !hasData && (list.status === 'idle' || list.status === 'pending');
	const isFetching = list.status === 'pending';

	return {
		models: list.data,
		isInitialLoading,
		isFetching,
		handleRefresh,
		page,
		pageSize,
		totalPages,
		totalItems: pagination.total,
		handlePageChange,
		handlePageSizeChange,
	};
}


export const useKioskModelFilter = () => {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'search',
			searchFields: ['referenceCode', 'name', 'description'],
			type: 'search' as const,
			value: searchValue,
			onChange: setSearchValue,
			placeholder: translate('nikki.vendingMachine.kioskModels.search.placeholder'),
		},
		{
			key: 'status',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: 'active', label: translate('nikki.general.status.active') },
				{ value: 'inactive', label: translate('nikki.general.status.inactive') },
			],
			placeholder: translate('nikki.vendingMachine.kioskModels.filter.status'),
		},
	], [searchValue, statusFilter, translate]);

	const graph = useMemo(
		() => buildSimpleSearchGraph(
			filters.map(filter => {
				if (filter.type === 'search') {
					return {
						key: filter.key,
						searchFields: filter.searchFields,
						type: filter.type,
						value: filter.value,
					};
				}
				return {
					key: filter.key,
					type: filter.type,
					value: filter.value,
				};
			}),
		), [filters],
	);

	return { filters, graph };
};