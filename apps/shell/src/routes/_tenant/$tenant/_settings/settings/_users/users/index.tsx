import { createFileRoute } from '@tanstack/react-router'

import { UserListPage } from '@/modules/settings/page/UsersListPage'


export const Route = createFileRoute(
	'/_tenant/$tenant/_settings/settings/_users/users/'
)({
	component: UserListPage,
})
