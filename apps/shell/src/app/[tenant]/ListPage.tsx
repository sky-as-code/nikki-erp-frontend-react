'use client';

import {
	ActionIcon,
	Anchor,
	Button, ButtonProps, Group, MantineStyleProps, NativeSelect, Popover, Stack, Switch, Text,
	UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	IconChevronLeft, IconChevronLeftPipe, IconChevronRight, IconChevronRightPipe,
	IconChevronsLeft,
	IconChevronsRight,
	IconFilter, IconLayoutDashboard, IconList, IconPlus, IconRefresh, IconSettings,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { MRT_Cell, MRT_ColumnDef } from 'mantine-react-table';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { DOMAttributes, useEffect, useState } from 'react';

import { useModuleLayout } from './ModuleLayout';
import classes from './ModuleLayout.module.css';
import { PageLayout } from './PageLayout';

import { useTenantUrl } from '@/common/context/TenantUrlProvider';
import { useUIState } from '@/common/context/UIProviders';
import { CreateTableContextReturn, DataTable, PaginationState, TableContextFetchResult, TableContextType, createTableContext } from '@/components/Table/DataTable';


export type ListPageProps = React.PropsWithChildren & {
	columns: MRT_ColumnDef<any>[],
	/**
	 * Cache key used in query manager to cache and get data for listing.
	 */
	cacheKey: string,
	defaultPageSize?: number,
	enableTable?: boolean,
	enableGrid?: boolean,
	/** Page name to display in the header. */
	pageName: string,
	/**
	 * The slug that should appear in address bar.
	 * This value is used in page split feature.
	 * */
	pageSlug: string,
	/**
	 * Function to fetch data for listing.
	 * This function is invoked on cache miss.
	 */
	fetchFn: (pagination: PaginationState) => Promise<TableContextFetchResult>,
};

export const ListPage: React.FC<ListPageProps> = (rawProps) => {
	const {
		enableGrid = true,
		enableTable = true,
		...props
	} = rawProps;
	const pathName = usePathname();
	const [ tableCtxResult, setTableCtxResult ] = useState<CreateTableContextReturn | null>(null);
	const split = useModuleLayout();

	useEffect(() => {
		const result = createTableContext({
			name: props.cacheKey,
			defaultPageSize: props.defaultPageSize ?? 50,
			fetchFn: props.fetchFn,
		});
		setTableCtxResult(result);
	}, []);

	useEffect(() => {
		if (pathName.match(`/${props.pageSlug}/*$`)) {
			split.setSplitMode('10_0');
		}
	}, [pathName]);

	if (!tableCtxResult) return null;
	const { context, Provider: ListDataProvider } = tableCtxResult;

	return (
		<>
			{split.is0_10 || <ListDataProvider>
				<ListStateProvider>
					<ListInner
						columns={props.columns}
						enableGrid={enableGrid}
						enableTable={enableTable}
						pageName={props.pageName}
						tableContext={context}
					/>
				</ListStateProvider>
			</ListDataProvider>}
			{props.children}
		</>
	);
};


const ListInner: React.FC<{
	columns: MRT_ColumnDef<any>[],
	enableTable: boolean,
	enableGrid: boolean,
	// isSplit: boolean,
	pageName: string,
	tableContext: React.Context<TableContextType>,
}> = ({ columns, tableContext, ...props }) => {
	const { notification: notif } = useUIState();
	const ctxVal = React.useContext(tableContext);
	const columnsDef = React.useMemo(() => columns, []);
	const split = useModuleLayout();

	useEffect(() => {
		if (ctxVal.isError) {
			notif.showError('You are served with cached data which may be stale.', 'Failed to load data');
		}
	}, [ctxVal.isError]);

	return (
		<PageLayout
			isSplitSmall={split.is3_7}
			isCollapsed={split.is1_9}
			toolbar={<ContentHeader
				enableGrid={props.enableGrid}
				enableTable={props.enableTable}
				tableContext={tableContext}
				pageName={props.pageName}
			/>}
		>
			{props.enableTable && <DataTable
				columnsDef={columnsDef as any}
				rows={ctxVal.rows}
			/>}
			<Group
				justify='flex-end'
				className='w-full px-4 py-2'
			>
				<TableActions
					ctxVal={ctxVal}
					enableGrid={props.enableGrid}
					enableTable={props.enableTable}
				/>
			</Group>
			<button
				className={clsx(
					'flex items-start absolute top-0 right-0 bottom-0 w-8 z-90 pt-4 border-none',
					'cursor-pointer hover:bg-gray-300 active:bg-gray-400 transition-colors',
					classes.showOnSplitCollapsed,
				)}
				onClick={() => split.setSplitMode('3_7')}
			>
				<IconChevronsRight size={20} />
			</button>
		</PageLayout>
	);
};

type ContentHeaderProps = {
	enableTable: boolean,
	enableGrid: boolean,
	tableContext: React.Context<TableContextType>;
	pageName: string,
};

const ContentHeader: React.FC<ContentHeaderProps> = ({ tableContext, ...props }) => {
	const ctxVal = React.useContext(tableContext);
	const split = useModuleLayout();

	return (
		<>
			<Group justify='space-between' mt='xs'>
				<Group gap='xs' justify='flex-start'>
					<Text component='span' fw='bold' fz='h3'>{props.pageName}</Text>
					<ActionIcon variant='subtle'><IconSettings /></ActionIcon>
				</Group>
				<ActionIcon
					onClick={() => split.setSplitMode('1_9')}
					variant='subtle'
					className={classes.showOnSplit}
					size='lg'
				>
					<IconChevronsLeft/>
				</ActionIcon>
			</Group>
			<Group gap='xs' justify='space-between' mt='xs' mb='xs'>
				<Group gap='xs' justify='flex-start'>
					<ToolbarButton fw='bold' leftSection={<IconPlus />}>Create</ToolbarButton>
					<ToolbarButton
						onClick={ctxVal.refetch}
						leftSection={
							<IconRefresh
								className={clsx(
									'transition-transform',
									{'animate-spin': ctxVal.isFetching},
								)}
							/>
						}
						disabled={ctxVal.isFetching}
					>
						Refresh
					</ToolbarButton>
				</Group>
				<Group gap={0} justify='flex-end'>
					<TableSettings
						ctxVal={ctxVal}
						enableGrid={props.enableGrid}
						enableTable={props.enableTable}
					/>
				</Group>
			</Group>
		</>
	);
};

type ToolbarButtonProps = ButtonProps & DOMAttributes<HTMLButtonElement> & {
	isActive?: boolean;
};
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ children, isActive, ...rest }) => {
	return (
		<Button size='compact-md' variant={isActive ? 'filled' : 'subtle'} fw='normal' {...rest}>
			{children}
		</Button>
	);
};

const TableActions: React.FC<{
	ctxVal: TableContextType,
	className?: string,
	enableTable?: boolean,
	enableGrid?: boolean,
}> = ({ ctxVal, ...props }) => {
	const {
		totalRows,
		pagination: {pageIndex, pageSize},
	} = ctxVal;
	const lastPage = Math.floor(totalRows / pageSize);
	const start = pageIndex * pageSize + 1;
	const end = Math.min(
		(pageIndex + 1) * pageSize,
		totalRows,
	);

	return (
		<Button.Group className={props.className}>
			<ToolbarButton
				disabled={pageIndex === 0}
				onClick={ctxVal.firstPage}
			><IconChevronLeftPipe /></ToolbarButton>
			<ToolbarButton
				disabled={pageIndex === 0}
				onClick={ctxVal.prevPage}
			><IconChevronLeft /></ToolbarButton>
			<Button.GroupSection size='compact-md' variant='subtle'>
				{start}-{end} of {ctxVal.totalRows}
			</Button.GroupSection>
			<ToolbarButton
				disabled={pageIndex === lastPage}
				onClick={ctxVal.nextPage}
			><IconChevronRight /></ToolbarButton>
			<ToolbarButton
				disabled={pageIndex === lastPage}
				onClick={ctxVal.lastPage}
			><IconChevronRightPipe /></ToolbarButton>
		</Button.Group>
	);
};

const TableSettings: React.FC<{
	ctxVal: TableContextType,
	enableTable?: boolean,
	enableGrid?: boolean,
}> = ({ ctxVal, ...props }) => {
	const { enableAutoRefresh, toggleAutoRefresh, viewMode, setViewMode } = React.useContext(ListStateContext);
	const { isMobile } = useUIState();

	return (
		<>
			<ToolbarButton><IconFilter /></ToolbarButton>
			<TableActions
				ctxVal={ctxVal}
				className={clsx(classes.hideOnSplit, { 'hidden': isMobile })}
				{...props}
			/>
			<Popover
				position='bottom'
				shadow='md'
				width={300}
				withArrow
			>
				<Popover.Target>
					<ToolbarButton><IconSettings /></ToolbarButton>
				</Popover.Target>
				<Popover.Dropdown>
					<Stack gap='sm'>
						<table className='border-non'>
							<tr className='h-0'><th className='w-[50%]'></th><th className='w-[50%]'></th></tr>
							<RowsPerPageSetting ctxVal={ctxVal} />
							<ViewModeSetting {...props} viewMode={viewMode} setViewMode={setViewMode} />
							<AutoRefreshSetting
								checked={enableAutoRefresh}
								onClick={toggleAutoRefresh}
							/>
						</table>
					</Stack>
				</Popover.Dropdown>
			</Popover>
		</>
	);
};

const RowsPerPageSetting: React.FC<{
	ctxVal: TableContextType,
}> = ({ ctxVal }) => (
	<tr className='h-[40px]'>
		<td>
			{/* <Group justify='space-between' align='center'> */}
			<Text size='md'>Rows per page</Text>
		</td>
		<td>
			<NativeSelect
				defaultValue={ctxVal.pagination.pageSize}
				onChange={(e) => ctxVal.setPagination({
					...ctxVal.pagination,
					pageSize: Number(e.target.value),
				})}
				data={['50', '100', '200', '500']}
				fz='md'
				style={{ width: '70px' }}
			/>
			{/* </Group> */}
		</td>
	</tr>
);

const ViewModeSetting: React.FC<{
	enableTable?: boolean,
	enableGrid?: boolean,
	viewMode: 'table' | 'grid',
	setViewMode: (s: 'table' | 'grid') => void,
}> = ({ enableTable, enableGrid, viewMode, setViewMode }) => (
	<tr className='h-[40px]'>
		<td>
			{/* <Group justify='space-between' align='center'> */}
			<Text size='md'>View mode</Text>
		</td>
		<td>
			<Button.Group>
				{enableTable && <ToolbarButton
					isActive={viewMode === 'table'}
					onClick={() => (viewMode !== 'table') && setViewMode('table')}
				><IconList /></ToolbarButton>}
				{enableGrid && <ToolbarButton
					isActive={viewMode === 'grid'}
					onClick={() => (viewMode !== 'grid') && setViewMode('grid')}
				><IconLayoutDashboard /></ToolbarButton>}
			</Button.Group>
			{/* </Group> */}
		</td>
	</tr>
);

const AutoRefreshSetting: React.FC<{
	checked: boolean,
	onClick: () => void,
}> = ({ checked, onClick }) => (
	<tr className='h-[40px]'>
		<td>
			{/* <Group justify='space-between' align='center'> */}
			<Text size='md'>Auto refresh</Text>
		</td>
		<td>
			<Switch checked={checked} onClick={onClick} />
			{/* </Group> */}
		</td>
	</tr>
);

type ListStateContextType = {
	enableAutoRefresh: boolean,
	viewMode: 'table' | 'grid',
	toggleAutoRefresh: () => void,
	setViewMode: (s: 'table' | 'grid') => void,
};

const ListStateContext = React.createContext<ListStateContextType>({} as any);

const ListStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [viewMode, setViewMode] = React.useState<ListStateContextType['viewMode']>('table');
	// const [enableAutoRefresh, setEnableAutoRefresh] = React.useState(true);
	const [ enableAutoRefresh, { toggle: toggleAutoRefresh} ] = useDisclosure(true);

	const val: ListStateContextType = {
		enableAutoRefresh,
		viewMode,
		toggleAutoRefresh,
		setViewMode,
	};

	return (
		<ListStateContext.Provider value={val}>
			{children}
		</ListStateContext.Provider>
	);
} ;

export type CelDetailLinkProps = {
	cell: MRT_Cell<any>,
	idField?: string,
	pageSlug: string,
};

export const CellDetailLink: React.FC<CelDetailLinkProps> = (props) => {
	const {
		cell,
		idField = 'id',
		pageSlug,
	} = props;
	const { setSplitMode } = useModuleLayout();
	const router = useRouter();
	const { getModulePath } = useTenantUrl();
	const modulePath = getModulePath();
	const model = cell.row.original;
	const url = `${modulePath}/${pageSlug}/${model[idField]}`;

	return (
		<Anchor
			component={Link}
			href={url}
			onClick={(evt) => {
				evt.preventDefault();
				setSplitMode('3_7');
				setTimeout(() => {
					router.push(url);
				}, 0);
			}}
		>
			{cell.getValue<string>()}
		</Anchor>
	);
};