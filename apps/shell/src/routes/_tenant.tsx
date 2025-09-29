import { createFileRoute, Outlet } from '@tanstack/react-router'

import { TenantLayout } from '@/modules/core/layout/TenantLayout'

export const Route = createFileRoute('/_tenant')({
	component: () => (
		<TenantLayout>
			<Outlet />
		</TenantLayout>
	),
})
