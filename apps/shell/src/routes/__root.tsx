import { createRootRoute, Outlet } from '@tanstack/react-router'

import { RootLayout } from '@/modules/core/layout/RootLayout'


export const Route = createRootRoute({
	component: () => (
		<RootLayout>
			<Outlet />
		</RootLayout>
	),
})


