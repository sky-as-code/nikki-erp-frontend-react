import { PageContainer } from '@/components/PageContainer/PageContainer';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_tenant/$tenant/_dashboard/dashboard/chart/')({
	component: Chart,
})

function Chart() {
	return <PageContainer title='Chart'>Chart</PageContainer>;
}
