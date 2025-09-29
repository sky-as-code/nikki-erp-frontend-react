import { createFileRoute } from '@tanstack/react-router'

import { UserListPage } from '@/modules/core/page/UsersListPage'


export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_users/users/'
)({
	component: UserListPage,
})
