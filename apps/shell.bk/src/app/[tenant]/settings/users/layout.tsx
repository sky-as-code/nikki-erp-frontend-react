'use client'

import { MRT_ColumnDef } from 'mantine-react-table'

import { CellDetailLink, ListPage } from '../../ListPage'

import { delay } from '@/common/utils'
import { PaginationState } from '@/components/Table/DataTable'
import { data } from '@/components/Table/SimpleTable'

// let testCount = 0;
const fetchFn = async (pagination: PaginationState) => {
	const start = pagination.pageIndex * pagination.pageSize
	const end = start + pagination.pageSize
	const paginatedData = data.slice(start, end)
	await delay(1000)
	// if (++testCount % 2 === 0) {
	// 	return Promise.reject(new Error('Test fetching error'));
	// }
	return { rows: paginatedData, totalRows: data.length }
}

const UserListPage: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<ListPage
			cacheKey='settings.users'
			columns={columns}
			pageSlug='users'
			pageName='Users'
			fetchFn={fetchFn}
		>
			{children}
		</ListPage>
	)
}

export default UserListPage

export const columns: MRT_ColumnDef<any>[] = [
	{
		accessorKey: 'name.firstName', //access nested data with dot notation
		header: 'First Name',
		Cell: ({ cell }) => {
			return <CellDetailLink cell={cell} idField='id' pageSlug='users' />
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
]
