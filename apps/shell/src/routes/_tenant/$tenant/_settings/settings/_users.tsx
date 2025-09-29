import { createFileRoute, Outlet } from '@tanstack/react-router'

import { UsersLayout } from '@/modules/core/layout/UsersLayout'

export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_users'
)({
	component: () => {
		return (
			<UsersLayout>
				<Outlet />
			</UsersLayout>
		)
	},
})

