import { TablePaginationProps } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	mediaPlaylistActions,
	selectMediaPlaylistList,
	selectMediaPlaylistListPagination,
} from '@/appState';
import { SearchGraph, SearchParams } from '@/types';

import type { Playlist } from '../types';


function usePagination(
	fetchList: (page: number, size: number, graph?: SearchGraph) => void,
	graph?: SearchGraph,
) {
	const { total, size } = useMicroAppSelector(selectMediaPlaylistListPagination);

	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(size ?? 10);

	React.useEffect(() => {
		setPage(1);
	}, [graph]);

	const handlePageChange = React.useCallback((newPage: number) => {
		setPage(newPage);
		fetchList(newPage, pageSize, graph);
	}, [fetchList, pageSize, graph]);

	const handlePageSizeChange = React.useCallback((value: string | null) => {
		const newSize = Number(value ?? size ?? 10);
		setPageSize(newSize);
		setPage(1);
		fetchList(1, newSize, graph);
	}, [fetchList, graph, size]);

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

export function useMediaPlaylistList({ graph }: { graph?: SearchGraph } = {}) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectMediaPlaylistList);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<Playlist> = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(mediaPlaylistActions.listMediaPlaylists(params));
	}, [dispatch]);

	const paginationState = usePagination(fetchList, graph);
	const { page, pageSize } = paginationState;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const playlists = list.data;
	const status = list.status;
	const isLoadingList = !playlists?.length && (status === 'pending' || status === 'idle');

	const pagination: TablePaginationProps = {
		totalItems: paginationState.totalItems,
		page: paginationState.page,
		totalPages: paginationState.totalPages,
		onPageChange: paginationState.handlePageChange,
		pageSize: paginationState.pageSize,
		onPageSizeChange: paginationState.handlePageSizeChange,
	};

	return {
		playlists,
		isLoadingList,
		handleRefresh,
		pagination,
	};
}
