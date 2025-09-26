

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
	MantineReactTable, useMantineReactTable,
	MRT_TableOptions, MRT_ColumnDef,
} from 'mantine-react-table';
import React, { createContext, useEffect, useMemo, useState } from 'react';


export type DataTableProps = {
	columnsDef: MRT_ColumnDef<any>[],
	rows: any[],
};

export const DataTable: React.FC<DataTableProps> = React.memo((props) => {
	const columns = React.useMemo<any>(() => props.columnsDef, []);

	const table = useMantineReactTable({
		...tableConfig,
		columns,
		data: props.rows,
	});

	return (
		<MantineReactTable
			table={table}
		/>
	);
});

const tableConfig: MRT_TableOptions<any> = {
	columns: [],
	data: [],
	mantinePaperProps: {
		shadow: '0', withBorder: false, radius: 0,
		className: 'flex overflow-x-auto bg-transparent w-full',
	},
	mantineTableContainerProps: {
		className: 'bg-transparent w-full',
		// style: {
		// 	maxHeight: 'calc(100vh - 50px - 117px)',
		// },
	},
	mantineTableProps: {
		className: 'table-auto',
	},

	enableRowSelection: true,
	enableRowNumbers: true,
	enableSelectAll: true,
	enableStickyHeader: true,
	enableStickyFooter: true,

	enableDensityToggle: false,
	enableFilters: false,
	enableFullScreenToggle: false,
	enableHiding: false,
	enableTopToolbar: false,
	enableBottomToolbar: false,

	enablePagination: false,
	manualPagination: true,
	positionToolbarAlertBanner: 'none',
};

export type PaginationState = {
	pageIndex: number,
	pageSize: number,
};

export type TableContextType = {
	// Is true when there is no data yet
	isPending: boolean,
	// Is true when there is an on-going network request
	isFetching: boolean,
	isError: boolean,
	isSuccess: boolean,

	error: Error | null,
	rows: any[],
	totalRows: number,
	rowsUpdatedAt: number,
	pagination: PaginationState,
	setPagination: (s: PaginationState) => void,
	refetch: () => void,
	firstPage: () => void,
	lastPage: () => void,
	prevPage: () => void,
	nextPage: () => void,
};

export type TableContextFetchResult = {
	rows: any[],
	totalRows: number,
};

export type CreateTableContextProps = {
	/**
	 * Name is used as caching key in data access layer, so it should be unique,
	 * except when you plan to reuse cache (all tables context share same data access layer's cache).
	 */
	name: string,
	defaultPageSize: number,
	fetchFn: (pagination: PaginationState) => Promise<TableContextFetchResult>,
};

export type CreateTableContextReturn = {
	context: React.Context<TableContextType>,
	Provider: React.FC<React.PropsWithChildren>,
};
export function createTableContext(props: CreateTableContextProps): CreateTableContextReturn {
	const context = createContext<TableContextType>({} as any);
	return {
		context,
		Provider: createTableProvider(context, props),
	};
}

export function createTableProvider(
	ctx: React.Context<TableContextType>,
	props: CreateTableContextProps,
): React.FC<React.PropsWithChildren> {
	return ({children}) => {
		const [pagination, setPagination] = useState<PaginationState>({
			pageIndex: 0,
			pageSize: props.defaultPageSize,
		});

		const queryResult = useQuery({
			queryKey: [props.name, pagination.pageIndex, pagination.pageSize],
			queryFn: () => props.fetchFn(pagination),
			placeholderData: (previousData) => previousData,
		});
		const value = useContextValue(queryResult, pagination, setPagination);

		useEffect(() => {
			queryResult.error && console.error(queryResult.error);
		}, [queryResult.error]);

		return (
			<ctx.Provider value={value}>
				{children}
			</ctx.Provider>
		);
	};
}

function createPaginationActions(
	setPagination: React.Dispatch<React.SetStateAction<PaginationState>>,
	maxPageIdx: number,
) {
	return {
		firstPage: () => setPagination(p => ({ ...p, pageIndex: 0 })),
		lastPage: () => setPagination(p => ({ ...p, pageIndex: maxPageIdx })),
		prevPage: () => setPagination(p => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) })),
		nextPage: () => setPagination(p => ({ ...p, pageIndex: Math.min(p.pageIndex + 1, maxPageIdx) })),
	};
}

function useContextValue(
	queryResult: UseQueryResult<TableContextFetchResult, Error>,
	pagination: PaginationState,
	setPagination: React.Dispatch<React.SetStateAction<PaginationState>>,
): TableContextType {
	const {
		dataUpdatedAt, error, refetch,
		isPending, isFetching, isError, isSuccess,
	} = queryResult;

	const rows = queryResult.data?.rows ?? [];
	const totalRows = queryResult.data?.totalRows ?? 0;

	const maxPageIdx = Math.floor(totalRows / pagination.pageSize);
	const paginationActions = createPaginationActions(setPagination, maxPageIdx);

	const value: TableContextType = useMemo(() => {
		const maskedError = error ? new Error('Error while fetching data') : null;

		return {
			isPending, isFetching, isError, isSuccess,
			error: maskedError,
			rows,
			rowsUpdatedAt: dataUpdatedAt,
			totalRows,
			pagination,
			setPagination,
			refetch,
			...paginationActions,
		};
	}, [
		isPending, isFetching, isError, isSuccess,
		error, rows, totalRows, dataUpdatedAt > 0,
		pagination.pageIndex, pagination.pageSize,
	]);
	return value;
}