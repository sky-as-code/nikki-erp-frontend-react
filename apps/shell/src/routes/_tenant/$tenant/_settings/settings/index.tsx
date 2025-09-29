import { createFileRoute } from '@tanstack/react-router'

import { SettingsPage } from '@/modules/settings/page/SettingsPage'


export const Route = createFileRoute('/_tenant/$tenant/_settings/settings/')({
	component: SettingsPage,
})

