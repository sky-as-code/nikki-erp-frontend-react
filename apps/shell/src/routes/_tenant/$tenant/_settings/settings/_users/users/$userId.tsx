import { createFileRoute } from '@tanstack/react-router'

import { UserDetailPage } from '@/modules/core/page/UserDetailPage'

export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_users/users/$userId'
)({
	component: UserDetailPage,
})