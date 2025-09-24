import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { PaginationTable } from '@/components/Table/PaginationTable';
import { SimpleTable } from '@/components/Table/SimpleTable';

export const Route = createFileRoute('/_tenant/$tenant/_dashboard/dashboard/table/')({
	component: TablePage,
})

function TablePage() {
	return (
		<PageContainer title='Tables'>
			<SimpleTable />
			<PaginationTable />
		</PageContainer>
	)
}
