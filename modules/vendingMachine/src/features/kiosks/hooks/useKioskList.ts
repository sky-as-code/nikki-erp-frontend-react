import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	VendingMachineDispatch,
	kioskActions,
	selectKioskList,
	selectKioskListPagination,
	KIOSK_DEFAULT_PAGE_SIZE,
	ListKiosksParams,
} from '@/appState';
import { buildSimpleSearchGraph } from '@/components/ControlPanel/buildSimpleSearchGraph';
import { ControlPanelFilterConfig } from '@/components/ControlPanel/types';
import { SearchGraph } from '@/components/FilterGroup';

import { ConnectionStatus, KioskMode } from '../types';


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


const useKioskFilter = () => {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [connectionFilter, setConnectionFilter] = useState<string[]>([]);
	const [modeFilter, setModeFilter] = useState<string[]>([]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'search',
			searchFields: ['code', 'name'],
			type: 'search' as const,
			value: searchValue,
			onChange: setSearchValue,
			placeholder: translate('nikki.vendingMachine.kiosk.search.placeholder'),
		},
		{
			key: 'isActive',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: 'active', label: translate('nikki.general.status.active') },
				{ value: 'inactive', label: translate('nikki.general.status.inactive') },
			],
			placeholder: translate('nikki.vendingMachine.kiosk.filter.status'),
		},
		{
			key: 'connectionStatus',
			type: 'multiSelect' as const,
			value: connectionFilter,
			onChange: (value: string[]) => setConnectionFilter(value),
			options: [
				{ value: ConnectionStatus.FAST, label: translate('nikki.vendingMachine.kiosk.connectionStatus.fast') },
				{ value: ConnectionStatus.SLOW, label: translate('nikki.vendingMachine.kiosk.connectionStatus.slow') },
				{ value: ConnectionStatus.DISCONNECTED, label: translate('nikki.vendingMachine.kiosk.connectionStatus.disconnected') },
			],
			placeholder: translate('nikki.vendingMachine.kiosk.filter.connectionStatus'),
		},
		{
			key: 'mode',
			type: 'multiSelect' as const,
			value: modeFilter,
			onChange: (value: string[]) => setModeFilter(value),
			options: [
				{ value: KioskMode.PENDING, label: translate('nikki.vendingMachine.kiosk.mode.pending') },
				{ value: KioskMode.SELLING, label: translate('nikki.vendingMachine.kiosk.mode.selling') },
				{ value: KioskMode.SLIDESHOW_ONLY, label: translate('nikki.vendingMachine.kiosk.mode.slideshowOnly') },
			],
			placeholder: translate('nikki.vendingMachine.kiosk.filter.mode'),
		},
	], [searchValue, statusFilter, connectionFilter, modeFilter, translate]);

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
