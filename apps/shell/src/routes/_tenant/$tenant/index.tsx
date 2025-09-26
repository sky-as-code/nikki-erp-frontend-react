import { createFileRoute, } from '@tanstack/react-router'

import { AppListPage } from '@/modules/core/apps/AppList/AppListPage'



export const Route = createFileRoute('/_tenant/$tenant/')({
	component: AppListPage,
})

