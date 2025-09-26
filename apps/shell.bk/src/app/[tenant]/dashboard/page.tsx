import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { PageContainer } from '@/components/PageContainer/PageContainer'

// NextJS config
export const revalidate = 0

export default function Dashboard() {
	return (
		<PageContainer title='Dashboard'>
			<DashboardContent />
		</PageContainer>
	)
}
