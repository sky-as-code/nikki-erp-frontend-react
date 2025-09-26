import { Outlet, createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '@/modules/core/auth/AuthLayout'


export const Route = createFileRoute('/_auth')({
	component: () => (
		<AuthLayout>
			<Outlet />
		</AuthLayout>
	),
})


