import { createFileRoute } from '@tanstack/react-router'
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { PageContainer } from '@/components/PageContainer/PageContainer';

// NextJS config
export const revalidate = 0;

export const Route = createFileRoute('/_tenant/$tenant/_dashboard/dashboard/')({
	component: Dashboard,
})
function Dashboard() {
	return (
		<PageContainer title='Dashboard'>
			<DashboardContent />
		</PageContainer>
	)
}
