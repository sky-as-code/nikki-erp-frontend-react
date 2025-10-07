import { createFileRoute, Outlet } from '@tanstack/react-router'

import { DashboardLayout } from '@/modules/core/layout/DashboardLayout'

export const Route = createFileRoute('/_tenant/$tenant/_dashboard')({
	component: () => (
		<DashboardLayout>
			<Outlet />
		</DashboardLayout>
	),
})


