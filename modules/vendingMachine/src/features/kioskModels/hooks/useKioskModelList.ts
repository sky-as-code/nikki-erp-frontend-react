import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	kioskModelActions,
	selectKioskModelList,
	selectKioskModelListPagination,
	DEFAULT_PAGE_SIZE,
} from '@/appState';


export function useKioskModelList() {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskModelList);
	const pagination = useMicroAppSelector(selectKioskModelListPagination);

	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);

	const fetchList = React.useCallback((targetPage: number, size: number) => {
		dispatch(kioskModelActions.listKioskModels({
			page: targetPage - 1,
			size,
		}));
	}, [dispatch]);

	React.useEffect(() => {
		if (list.status === 'idle') {
			fetchList(page, pageSize);
		}
	}, [dispatch, list.status, fetchList, page, pageSize]);

	const handlePageChange = React.useCallback((newPage: number) => {
		setPage(newPage);
		fetchList(newPage, pageSize);
	}, [fetchList, pageSize]);

	const handlePageSizeChange = React.useCallback((value: string | null) => {
		const newSize = Number(value ?? DEFAULT_PAGE_SIZE);
		setPageSize(newSize);
		setPage(1);
		fetchList(1, newSize);
	}, [fetchList]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize);
	}, [fetchList, page, pageSize]);

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
