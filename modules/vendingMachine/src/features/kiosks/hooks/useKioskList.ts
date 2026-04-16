import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';


import {
	VendingMachineDispatch,
	kioskActions,
	selectKioskList,
	selectKioskListPagination,
} from '@/appState';
import { SearchGraph, SearchParams } from '@/types';

import { Kiosk } from '../types';


function usePagination(fetchList: (page: number, size: number, graph?: SearchGraph) => void, graph?: SearchGraph) {
	const { total, size } = useMicroAppSelector(selectKioskListPagination);

	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(size ?? 10);

	const handlePageChange = React.useCallback((newPage: number) => {
		setPage(newPage);
		fetchList(newPage, pageSize, graph);
	}, [fetchList, pageSize, graph]);

	const handlePageSizeChange = React.useCallback((value: string | null) => {
		const newSize = Number(value ?? size ?? 10);
		setPageSize(newSize);
		setPage(1);
		fetchList(1, newSize, graph);
	}, [fetchList, graph]);

	const totalPages = Math.max(1, Math.ceil(total / (size || pageSize)));

	return {
		page,
		pageSize,
		totalPages,
		totalItems: total,
		handlePageChange,
		handlePageSizeChange,
	};
}

export function useKioskList({ graph }: { graph?: SearchGraph } = {}) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskList);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<Kiosk> = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(kioskActions.listKiosks(params));
	}, [dispatch]);

	const pagination = usePagination(fetchList, graph);
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const kiosks = list.data;
	const status = list.status;
	const isLoading = !kiosks?.length && (status === 'pending' || status === 'idle');
	const isEmpty = !kiosks?.length && status !== 'idle' && status !== 'pending';

	return {
		kiosks,
		status,
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}

