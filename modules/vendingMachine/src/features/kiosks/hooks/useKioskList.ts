import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { useKioskFilter } from './useKioskFilter';

import {
	VendingMachineDispatch,
	kioskActions,
	selectKioskList,
	selectKioskListPagination,
	KIOSK_DEFAULT_PAGE_SIZE,
	ListKiosksParams,
} from '@/appState';
import { SearchGraph } from '@/components/FilterGroup';



export function useKioskList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskList);
	const pagination = useMicroAppSelector(selectKioskListPagination);

	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(KIOSK_DEFAULT_PAGE_SIZE);
	const { filters, graph } = useKioskFilter();

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: ListKiosksParams = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(kioskActions.listKiosks(params));
	}, [dispatch]);

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handlePageChange = React.useCallback((newPage: number) => {
		setPage(newPage);
		fetchList(newPage, pageSize, graph);
	}, [fetchList, pageSize, graph]);

	const handlePageSizeChange = React.useCallback((value: string | null) => {
		const newSize = Number(value ?? KIOSK_DEFAULT_PAGE_SIZE);
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
		kiosks: list.data,
		isInitialLoading,
		isFetching,
		handleRefresh,
		page,
		pageSize,
		totalPages,
		totalItems: pagination.total,
		handlePageChange,
		handlePageSizeChange,
		filters,
	};
}

