import { createFileRoute } from '@tanstack/react-router'

import { PageContainer } from '@/common/components/PageContainer/PageContainer'

export const Route = createFileRoute('/_tenant/$tenant/_dashboard/dashboard/chart/')({
	component: Chart,
})

function Chart() {
	return <PageContainer title='Chart'>Chart</PageContainer>
}
