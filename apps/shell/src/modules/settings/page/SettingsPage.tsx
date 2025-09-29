
import {
    Button,
    ButtonProps,
    Group,
    MantineStyleProps,
    NativeSelect,
    Popover,
    Stack,
    Text,
} from '@mantine/core'
import { notifications as notif } from '@mantine/notifications'
import {
    IconChevronLeft,
    IconChevronLeftPipe,
    IconChevronRight,
    IconChevronRightPipe,
    IconFilter,
    IconLayoutDashboard,
    IconList,
    IconPlus,
    IconRefresh,
    IconSettings,
} from '@tabler/icons-react'
import clsx from 'clsx'
import React, { DOMAttributes, useEffect } from 'react'

import { PageLayout } from '@/common/components/layout/PageLayout'
import {
    DataTable,
    TableContextType,
    createTableContext,
} from '@/common/components/Table/DataTable'
import { data, columns } from '@/common/components/Table/SimpleTable'
import { useUIState } from '@/common/context/UIProviders'
import { delay } from '@/common/utils'

// let testCount = 0
export const SettingsPage: React.FC = () => {
    const {
        backgroundColor,
        screen: { setCurrentScreen },
    } = useUIState()
    const { context, Provider } = createTableContext({
        name: 'settings.users',
        defaultPageSize: 50,
        fetchFn: async (pagination) => {
            const start = pagination.pageIndex * pagination.pageSize
            const end = start + pagination.pageSize
            const paginatedData = data.slice(start, end)
            await delay(1000)
            // if (++testCount % 2 === 0) {
            // 	throw new Error('Test fetching error')
            // }
            return { rows: paginatedData, totalRows: data.length }
        },
    })

    useEffect(() => {
        setCurrentScreen('settings.users')
    }, [])

    return (
	<Provider>
		<SettingsInner backgroundColor={backgroundColor} tableContext={context} />
	</Provider>
    )
}



const SettingsInner: React.FC<{
    backgroundColor: MantineStyleProps['bg']
    tableContext: React.Context<TableContextType>
}> = React.memo(({ backgroundColor, tableContext }) => {
    const ctxVal = React.useContext(tableContext)
    const columnsDef = React.useMemo(() => columns, [])

    useEffect(() => {
        if (ctxVal.isError) {
            notif.show({
                title: 'Failed to load data',
                message: 'You are served with cached data which may be stale.',
                color: 'red',
                autoClose: false,
                withBorder: true,
            })
        }
    }, [ctxVal.isError])

    return (
	<PageLayout
		toolbar={
			<ContentHeader
				backgroundColor={backgroundColor}
				tableContext={tableContext}
                />
            }
        >
		<DataTable
			columnsDef={columnsDef as any}
			rows={ctxVal.rows}
                // rowsUpdatedAt={ctxVal.rowsUpdatedAt}
            />
	</PageLayout>
    )
})

type ContentHeaderProps = {
    backgroundColor: MantineStyleProps['bg']
    tableContext: React.Context<TableContextType>
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
    backgroundColor,
    tableContext,
}) => {
    const ctxVal = React.useContext(tableContext)

    return (
	<>
		<Group gap='xs' justify='flex-start' mt='xs' bg={backgroundColor}>
			<Text component='span' fw='bold' fz='h3'>
				Settings
			</Text>
			<IconSettings />
		</Group>
		<Group
			gap='xs'
			justify='space-between'
			mt='xs'
			mb='xs'
			bg={backgroundColor}
            >
			<Group gap='xs' justify='flex-start'>
				<ToolbarButton fw='bold' leftSection={<IconPlus />}>
					Create
				</ToolbarButton>
				<ToolbarButton
					onClick={ctxVal.refetch}
					leftSection={
						<IconRefresh
							className={clsx('transition-transform', {
                                    'animate-spin': ctxVal.isFetching,
                                })}
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
    )
}

type ToolbarButtonProps = ButtonProps &
    DOMAttributes<HTMLButtonElement> & {
        isActive?: boolean
    }
const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    children,
    isActive,
    ...rest
}) => {
    return (
	<Button
		size='compact-md'
		variant={isActive ? 'filled' : 'subtle'}
		fw='normal'
		{...rest}
        >
		{children}
	</Button>
    )
}

const TableActions: React.FC<{ ctxVal: TableContextType }> = ({ ctxVal }) => {
    const {
        totalRows,
        pagination: { pageIndex, pageSize },
    } = ctxVal
    const lastPage = Math.floor(totalRows / pageSize)
    const start = pageIndex * pageSize + 1
    const end = Math.min((pageIndex + 1) * pageSize, totalRows)

    return (
	<Button.Group>
		<ToolbarButton>
			<IconFilter />
		</ToolbarButton>
		<ToolbarButton disabled={pageIndex === 0} onClick={ctxVal.firstPage}>
			<IconChevronLeftPipe />
		</ToolbarButton>
		<ToolbarButton disabled={pageIndex === 0} onClick={ctxVal.prevPage}>
			<IconChevronLeft />
		</ToolbarButton>
		<Button.GroupSection size='compact-md' variant='subtle'>
			{start}-{end} of {ctxVal.totalRows}
		</Button.GroupSection>
		<ToolbarButton
			disabled={pageIndex === lastPage}
			onClick={ctxVal.nextPage}
            >
			<IconChevronRight />
		</ToolbarButton>
		<ToolbarButton
			disabled={pageIndex === lastPage}
			onClick={ctxVal.lastPage}
            >
			<IconChevronRightPipe />
		</ToolbarButton>
		<TableSettings ctxVal={ctxVal} />
	</Button.Group>
    )
}

const TableSettings: React.FC<{ ctxVal: TableContextType }> = ({ ctxVal }) => {
    return (
	<Popover position='bottom' withArrow shadow='md'>
		<Popover.Target>
			<ToolbarButton>
				<IconSettings />
			</ToolbarButton>
		</Popover.Target>
		<Popover.Dropdown>
			<Stack gap='sm'>
				<Group justify='space-between' align='center'>
					<Text size='md'>Rows per page</Text>
					<NativeSelect
						defaultValue={ctxVal.pagination.pageSize}
						onChange={(e) =>
                                ctxVal.setPagination({
                                    ...ctxVal.pagination,
                                    pageSize: Number(e.target.value),
                                })
                            }
						data={['50', '100', '200', '500']}
						fz='md'
						style={{ width: '70px' }}
                        />
				</Group>
				<Group justify='space-between' align='center'>
					<Text size='md'>View mode</Text>
					<Button.Group>
						<ToolbarButton isActive>
							<IconList />
						</ToolbarButton>
						<ToolbarButton>
							<IconLayoutDashboard />
						</ToolbarButton>
					</Button.Group>
				</Group>
			</Stack>
		</Popover.Dropdown>
	</Popover>
    )
}
