'use client';

import { useModuleLayout } from '@app/[tenant]/ModuleLayout';
import {
	Anchor,
	Button, ButtonProps, Group, MantineStyleProps, NativeSelect, Popover, Stack, Text,
} from '@mantine/core';
import { notifications as notif } from '@mantine/notifications';
import {
	IconChevronLeft, IconChevronLeftPipe, IconChevronRight, IconChevronRightPipe,
	IconFilter, IconLayoutDashboard, IconList, IconPlus, IconRefresh, IconSettings,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { MRT_ColumnDef } from 'mantine-react-table';
import React, { DOMAttributes, useEffect } from 'react';

import { PageLayout } from '../../PageLayout';

import UserDetailPage from './detail/page';

import { useUIState } from '@/common/context/UIProviders';
import { delay } from '@/common/utils';
import { DataTable, TableContextType, createTableContext } from '@/components/Table/DataTable';
import { data, Person } from '@/components/Table/SimpleTable';


let testCount = 0;
const UserListPage: React.FC = () => {
	const { splitRequest } = useModuleLayout();
	const { backgroundColor } = useUIState();
	const { context, Provider } = createTableContext({
		name: 'settings.users',
		defaultPageSize: 50,
		fetchFn: async (pagination) => {
			const start = pagination.pageIndex * pagination.pageSize;
			const end = start + pagination.pageSize;
			const paginatedData = data.slice(start, end);
			await delay(1000);
			if (++testCount % 2 === 0) {
				throw new Error('Test fetching error');
			}
			return { rows: paginatedData, totalRows: data.length };
		},
	});
	const isSplit = splitRequest instanceof UserSplitRequest;
	const userSplitReq: UserSplitRequest = splitRequest as UserSplitRequest;

	useEffect(() => {
		if (isSplit) {
			const { pathname } = window.location;
			window.history.pushState({}, '', `${pathname}/${userSplitReq.id}`);
		}
	}, [isSplit]);

	return (
		<>
			<Provider>
				<UserListInner
					isSplit={isSplit}
					backgroundColor={backgroundColor} tableContext={context}
				/>
			</Provider>
			{isSplit && (
				<UserDetailPage
					id={userSplitReq.id}
					isSplit={isSplit}
				/>
			)}
		</>
	);
};

export default UserListPage;

class UserSplitRequest {
	constructor(
		public id: string,
	) {}
}

export const columns: MRT_ColumnDef<Person>[] = [
	{
		accessorKey: 'name.firstName', //access nested data with dot notation
		header: 'First Name',
		Cell: ({ cell }) => {
			const { setSplitRequest } = useModuleLayout();
			const model: Person = cell.row.original;
			return (
				<Anchor
					href={`/${model.id}`}
					onClick={(evt) => {
						evt.preventDefault();
						setSplitRequest(new UserSplitRequest(model.id));
					}}
					// className='text-blue-500 underline'
				>
					{cell.getValue<string>()}
				</Anchor>
			);
		},
	},
	{
		accessorKey: 'name.lastName',
		header: 'Last Name',
	},
	{
		accessorKey: 'address', //normal accessorKey
		header: 'Address',
	},
	{
		accessorKey: 'city',
		header: 'City',
	},
	{
		accessorKey: 'state',
		header: 'State',
	},
];


const UserListInner: React.FC<{
	backgroundColor: MantineStyleProps['bg'],
	isSplit: boolean,
	tableContext: React.Context<TableContextType>,
}> = React.memo(({ backgroundColor, isSplit, tableContext }) => {
	const ctxVal = React.useContext(tableContext);
	const columnsDef = React.useMemo(() => columns, []);

	useEffect(() => {
		if (ctxVal.isError) {
			notif.show({
				title: 'Failed to load data',
				message: 'You are served with cached data which may be stale.',
				color: 'red',
				autoClose: false,
				withBorder: true,
			});
		}
	}, [ctxVal.isError]);

	return (
		<PageLayout
			isSplitSmall={isSplit}
			toolbar={<ContentHeader backgroundColor={backgroundColor} tableContext={tableContext} />}
		>
			<DataTable
				columnsDef={columnsDef as any}
				rows={ctxVal.rows}
				// rowsUpdatedAt={ctxVal.rowsUpdatedAt}
			/>
		</PageLayout>
	);
});

type ContentHeaderProps = {
	backgroundColor: MantineStyleProps['bg'];
	tableContext: React.Context<TableContextType>;
};

const ContentHeader: React.FC<ContentHeaderProps> = ({ backgroundColor, tableContext }) => {
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
					<TableActions ctxVal={ctxVal} />
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

const TableActions: React.FC<{ ctxVal: TableContextType }> = ({ ctxVal }) => {
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
			<TableSettings ctxVal={ctxVal} />
		</Button.Group>
	);
};

const TableSettings: React.FC<{ ctxVal: TableContextType }> = ({ ctxVal }) => {
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
							<ToolbarButton isActive><IconList /></ToolbarButton>
							<ToolbarButton><IconLayoutDashboard /></ToolbarButton>
						</Button.Group>
					</Group>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
};
