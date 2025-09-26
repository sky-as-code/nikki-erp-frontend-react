import { createFileRoute, Outlet } from '@tanstack/react-router';

import { TenantRootLayout } from '@/modules/core/apps/layout/TenantRootLayout';

export const Route = createFileRoute('/_tenant')({
	component: () => (
		<TenantRootLayout>
			<Outlet />
		</TenantRootLayout>
	),
});
