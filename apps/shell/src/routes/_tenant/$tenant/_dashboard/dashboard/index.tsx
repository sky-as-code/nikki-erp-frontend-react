import { createFileRoute } from '@tanstack/react-router'

import { PageContainer } from '@/common/components/PageContainer/PageContainer'
import { DashboardContent } from '@/modules/core/components/dashboard/DashboardContent'

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
