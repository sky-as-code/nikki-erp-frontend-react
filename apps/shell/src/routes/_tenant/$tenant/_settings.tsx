import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SettingsLayout } from '@/modules/settings/layout/SettingsLayout'


export const Route = createFileRoute('/_tenant/$tenant/_settings')({
	component: () =>  (
		<SettingsLayout>
			<Outlet />
		</SettingsLayout>
	),
})
