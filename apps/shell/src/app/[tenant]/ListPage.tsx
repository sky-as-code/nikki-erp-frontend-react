'use client';

import {
	Anchor,
	Button, ButtonProps, Group, MantineStyleProps, NativeSelect, Popover, Stack, Text,
} from '@mantine/core';
import {
	IconChevronLeft, IconChevronLeftPipe, IconChevronRight, IconChevronRightPipe,
	IconFilter, IconLayoutDashboard, IconList, IconPlus, IconRefresh, IconSettings,
} from '@tabler/icons-react';
import clsx from 'classnames';
import { MRT_Cell, MRT_ColumnDef } from 'mantine-react-table';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { DOMAttributes, useEffect, useState } from 'react';

import { PageLayout } from './PageLayout';

import { useTenantUrl } from '@/common/context/TenantUrlProvider';
import { useUIState } from '@/common/context/UIProviders';
import { CreateTableContextReturn, DataTable, PaginationState, TableContextFetchResult, TableContextType, createTableContext } from '@/components/Table/DataTable';


export type ListComponentProps = React.PropsWithChildren & {
	isSplit: boolean,
	backgroundColor: MantineStyleProps['bg'],
	tableContext?: React.Context<TableContextType>,
};

export type ListPageProps = React.PropsWithChildren & {
	component?: React.FC<ListComponentProps>,
	columns: MRT_ColumnDef<any>[],
	cacheKey: string,
	defaultPageSize?: number,
	enableTable?: boolean,
	enableGrid?: boolean,
	pageSlug: string,
	fetchFn: (pagination: PaginationState) => Promise<TableContextFetchResult>,
};

export const ListPage: React.FC<ListPageProps> = (rawProps) => {
	const {
		component: Component,
		enableGrid = true,
		enableTable = true,
		...props
	} = rawProps;
	const pathName = usePathname();
	const { backgroundColor } = useUIState();
	const [ tableCtxResult, setTableCtxResult ] = useState<CreateTableContextReturn | null>(null);
	const [ listVisible, setListVisible ] = useState(false);
	const [splitState, setSplitState] = useState<'full' | 'split' | 'hidden'>('hidden');

	useEffect(() => {
		const result = createTableContext({
			name: props.cacheKey,
			defaultPageSize: props.defaultPageSize ?? 50,
			fetchFn: props.fetchFn,
		});
		setTableCtxResult(result);
	}, []);

	useEffect(() => {
		if (pathName.match(`/${props.pageSlug}/?$`)) {
			setListVisible(true);
			setSplitState('full');
		}
		else {
			if (listVisible) setSplitState('split');
			else setSplitState('hidden');
		}
	}, [pathName]);

	if (!tableCtxResult) return null;
	const { context, Provider: ListDataProvider } = tableCtxResult;

	return (
		<>
			{(splitState != 'hidden') && <ListDataProvider>
				<ListStateProvider>
					<ListInner
						backgroundColor={backgroundColor}
						columns={props.columns}
						enableGrid={enableGrid}
						enableTable={enableTable}
						isSplit={splitState === 'split'}
						tableContext={context}
					/>
				</ListStateProvider>
			</ListDataProvider>}
			{props.children}
		</>
	);
};


const ListInner: React.FC<{
	backgroundColor: MantineStyleProps['bg'],
	columns: MRT_ColumnDef<any>[],
	enableTable?: boolean,
	enableGrid?: boolean,
	isSplit: boolean,
	tableContext: React.Context<TableContextType>,
}> = ({ backgroundColor, columns, isSplit, tableContext, ...props }) => {
	const { notification: notif } = useUIState();
	const ctxVal = React.useContext(tableContext);
	const columnsDef = React.useMemo(() => columns, []);

	useEffect(() => {
		if (ctxVal.isError) {
			notif.showError('You are served with cached data which may be stale.', 'Failed to load data');
		}
	}, [ctxVal.isError]);

	return (
		<PageLayout
			isSplitSmall={isSplit}
			toolbar={<ContentHeader
				backgroundColor={backgroundColor}
				tableContext={tableContext}
			/>}
		>
			{props.enableTable && <DataTable
				columnsDef={columnsDef as any}
				rows={ctxVal.rows}
			/>}
		</PageLayout>
	);
};

type ContentHeaderProps = {
	backgroundColor: MantineStyleProps['bg'];
	enableTable?: boolean,
	enableGrid?: boolean,
	tableContext: React.Context<TableContextType>;
};

const ContentHeader: React.FC<ContentHeaderProps> = ({ backgroundColor, tableContext, ...props }) => {
	const ctxVal = React.useContext(tableContext);

	return (
		<>
			<Group gap='xs' justify='flex-start' mt='xs' bg={backgroundColor}>
				<Text component='span' fw='bold' fz='h3'>Settings</Text>
				<IconSettings />
			</Group>
			<Group gap='xs' justify='space-between' mt='xs' mb='xs' bg={backgroundColor}>
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
				<Group gap='xs' justify='flex-end'>
					<TableActions
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
		<Button.Group>
			<ToolbarButton><IconFilter /></ToolbarButton>
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
			<TableSettings
				ctxVal={ctxVal}
				enableGrid={props.enableGrid}
				enableTable={props.enableTable}
			/>
		</Button.Group>
	);
};

const TableSettings: React.FC<{
	ctxVal: TableContextType,
	enableTable?: boolean,
	enableGrid?: boolean,
}> = ({ ctxVal, ...props }) => {
	const { viewMode, setViewMode } = React.useContext(ListStateContext);

	return (
		<Popover position='bottom' withArrow shadow='md'>
			<Popover.Target>
				<ToolbarButton><IconSettings /></ToolbarButton>
			</Popover.Target>
			<Popover.Dropdown>
				<Stack gap='sm'>
					<Group justify='space-between' align='center'>
						<Text size='md'>Rows per page</Text>
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
					</Group>
					<Group justify='space-between' align='center'>
						<Text size='md'>View mode</Text>
						<Button.Group>
							{props.enableTable && <ToolbarButton
								isActive={viewMode === 'table'}
								onClick={() => (viewMode !== 'grid') && setViewMode('grid')}
							><IconList /></ToolbarButton>}
							{props.enableGrid && <ToolbarButton
								isActive={viewMode === 'grid'}
								onClick={() => (viewMode !== 'table') && setViewMode('table')}
							><IconLayoutDashboard /></ToolbarButton>}
						</Button.Group>
					</Group>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
};

type ListStateContextType = {
	viewMode: 'table' | 'grid',
	setViewMode: (s: 'table' | 'grid') => void,
};

const ListStateContext = React.createContext<ListStateContextType>({} as any);

const ListStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [viewMode, setViewMode] = React.useState<ListStateContextType['viewMode']>('table');

	return (
		<ListStateContext.Provider value={{ viewMode, setViewMode }}>
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
	// const { setSplitRequest } = useModuleLayout();
	const { getModulePath } = useTenantUrl();
	const modulePath = getModulePath();
	const model = cell.row.original;

	return (
		<Anchor
			component={Link}
			href={`${modulePath}/${pageSlug}/${model[idField]}`}
			// onClick={() => {
			// 	setTimeout(() => {
			// 		setSplitRequest(new SplitRequestSideBar());
			// 	}, 0);
			// }}
		>
			{cell.getValue<string>()}
		</Anchor>
	);
};