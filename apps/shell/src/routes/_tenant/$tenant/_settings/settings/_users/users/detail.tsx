import { createFileRoute } from '@tanstack/react-router'

import { UserDetailPage } from '@/modules/core/user/UserDetail'

export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_users/users/detail'
)({
	component: UserDetailPage,
})
