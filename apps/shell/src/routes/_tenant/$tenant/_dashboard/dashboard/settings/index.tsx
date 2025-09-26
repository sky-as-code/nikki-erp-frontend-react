import { createFileRoute } from '@tanstack/react-router'

import { PageContainer } from '@/common/components/PageContainer/PageContainer'


export const Route = createFileRoute('/_tenant/$tenant/_dashboard/dashboard/settings/')({
	component: Settings,
})

function Settings() {
	return <PageContainer title='Settings'>Settings</PageContainer>
}
