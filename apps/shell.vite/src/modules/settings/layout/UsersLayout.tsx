import { delay } from '@nikkierp/common/utils';
// import { CellDetailLink, ListPageLayout } from '@nikkierp/ui/components';
// import { PaginationState } from '@nikkierp/ui/components/Table/DataTable';
// import { data } from '@nikkierp/ui/components/Table/SimpleTable';
import { MRT_ColumnDef } from 'mantine-react-table';

// let testCount = 0;
const fetchFn = async (pagination: any) => {
	const start = pagination.pageIndex * pagination.pageSize;
	const end = start + pagination.pageSize;
	const paginatedData = [] as any; //data.slice(start, end);
	await delay(1000);
	// if (++testCount % 2 === 0) {
	// 	return Promise.reject(new Error('Test fetching error'));
	// }
	return { rows: paginatedData, totalRows: 0 };
};

export const UsersLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<></>
		// <ListPageLayout
		// 	cacheKey='settings.users'
		// 	columns={columns}
		// 	pageSlug='users'
		// 	pageName='Users'
		// 	fetchFn={fetchFn}
		// >
		// 	{children}
		// </ListPageLayout>
	);
};



// const columns: MRT_ColumnDef<any>[] = [
// 	{
// 		accessorKey: 'name.firstName', //access nested data with dot notation
// 		header: 'First Name',
// 		Cell: ({ cell }) => {
// 			return <CellDetailLink cell={cell} idField='id' pageSlug='users' />;
// 		},
// 	},
// 	{
// 		accessorKey: 'name.lastName',
// 		header: 'Last Name',
// 	},
// 	{
// 		accessorKey: 'address', //normal accessorKey
// 		header: 'Address',
// 	},
// 	{
// 		accessorKey: 'city',
// 		header: 'City',
// 	},
// 	{
// 		accessorKey: 'state',
// 		header: 'State',
// 	},
// ];
