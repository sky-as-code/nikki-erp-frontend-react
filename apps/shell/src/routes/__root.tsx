import { createRootRoute, Outlet } from '@tanstack/react-router'

import { RootLayout } from '@/common/components/layout/RootLayout'


export const Route = createRootRoute({
	component: () => (
		<RootLayout>
			<Outlet />
		</RootLayout>
	),
})


