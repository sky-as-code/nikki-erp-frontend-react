import { createFileRoute } from '@tanstack/react-router';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { PageContainer } from '@/components/PageContainer/PageContainer';

export const Route = createFileRoute('/_tenant/$tenant/_dashboard/dashboard/')({
	component: Dashboard,
});
function Dashboard() {
	return (
		<PageContainer title='Dashboard'>
			<DashboardContent />
		</PageContainer>
	);
}
