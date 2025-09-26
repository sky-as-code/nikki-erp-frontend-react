import { createFileRoute } from '@tanstack/react-router';

import { PageContainer } from '@/common/components/PageContainer/PageContainer';
import { PaginationTable } from '@/common/components/Table/PaginationTable';
import { SimpleTable } from '@/common/components/Table/SimpleTable';

export const Route = createFileRoute('/_tenant/$tenant/_dashboard/dashboard/table/')({
	component: TablePage,
});

function TablePage() {
	return (
		<PageContainer title='Tables'>
			<SimpleTable />
			<PaginationTable />
		</PageContainer>
	);
}
